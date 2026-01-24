'use client'

import React, { FC, useCallback, useState, useEffect } from 'react'
import Messages from './Messages'
import ChatInput from './ChatInput'
import { Message } from '@/lib/validations/message'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { getSessionKeys, hasSessionKeys } from '@/lib/sessionKeys'
import { getIdentityKey } from '@/lib/encryption/indexdb'
import { toast } from 'react-hot-toast'
import { deriveSessionKeys } from '@/lib/encryption/keys'
import { decryptMessage } from '@/lib/encryption/messageEncryption'

interface ChatContainerProps {
    initialMessages: Message[]
    sessionId: string
    sessionImg: string | null | undefined
    chatPartner: User
    chatId: string
    friends?: User[]
}

const ChatContainer: FC<ChatContainerProps> = ({
    initialMessages,
    sessionId,
    sessionImg,
    chatPartner,
    chatId,
    friends = []
}) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [replyingTo, setReplyingTo] = useState<Message | null>(null)
    const [isPartnerTyping, setIsPartnerTyping] = useState(false)
    const [keysReady, setKeysReady] = useState(false)
    const [isDecrypting, setIsDecrypting] = useState(true)
    const [isImageUrl, setIsImageUrl] = useState(false);

    const addOptimisticMessage = useCallback((message: Message) => {
        setMessages((prev) => [{ ...message, isOptimistic: true } as Message, ...prev])
    }, [])

    const handleReply = useCallback((message: Message) => {
        setReplyingTo(message)
    }, [])

    const cancelReply = useCallback(() => {
        setReplyingTo(null)
    }, [])

    useEffect(() => {
        const deriveKeys = async () => {
            if(!hasSessionKeys(chatId)) {
                console.log("Deriving session keys for chat:", chatId);
                const ourPublicKey = await getIdentityKey();
                if(!ourPublicKey) {
                    console.error("Our public key is not available");
                    return;
                }
                const partnerIdentityKeyResponse = await fetch(`/api/keys/identity?userId=${chatPartner.id}`);
                const { identityKey: theirPublicKey } = await partnerIdentityKeyResponse.json();
                await deriveSessionKeys(ourPublicKey, theirPublicKey, sessionId, chatPartner.id, chatId);
            }
            console.log("Session keys derived for chat:", chatId);
            setKeysReady(true);
        }
        deriveKeys();
    }, [chatId, chatPartner.id, sessionId])

    useEffect(() => {
        const decryptInitialMessages = async () => {
            if (!keysReady) return;
            
            const sessionKeys = getSessionKeys(chatId);
            if (!sessionKeys) {
                setMessages(initialMessages);
                setIsDecrypting(false);
                return;
            }

            const decryptedMessages = await Promise.all(
                
                initialMessages.map(async (message) => {
                    if (message.imagePayload) {
                        return message;
                    }
                    
                    if (message.senderId !== sessionId && message.nonce) {
                        try {
                            const decryptedText = await decryptMessage(message.text, sessionKeys.rx, message.nonce);
                            try {
                                const parsed = JSON.parse(decryptedText);
                                if(parsed && parsed.type === "image"){
                                    return {...message, imagePayload: parsed, text: "", imagePayloadNonce: message.nonce }
                                }
                            } catch (error) {
                                console.log("Not an image payload");
                            }

                            return { ...message, text: decryptedText };
                        } catch (error) {
                            console.error("Failed to decrypt message:", message.id, error);
                            return { ...message, text: "[Unable to decrypt message]" };
                        }
                    }
                    if (message.senderId === sessionId && message.nonce) {
                        try {
                            const decryptedText = await decryptMessage(message.text, sessionKeys.tx, message.nonce);
                            try {
                                const parsed = JSON.parse(decryptedText);
                                if(parsed && parsed.type === "image"){
                                    return {...message, imagePayload: parsed, text: "", imagePayloadNonce: message.nonce }
                                }
                            } catch (error) {
                                console.log("Not an image payload");
                            }

                            return { ...message, text: decryptedText };
                        } catch (error) {
                            console.error("Failed to decrypt own message:", message.id, error);
                            return { ...message, text: "[Unable to decrypt message]" };
                        }
                    }
                    return message;
                })
            );

            setMessages(decryptedMessages);
            setIsDecrypting(false);
        };

        decryptInitialMessages();
    }, [keysReady, chatId, initialMessages, sessionId])

    
    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`chat:${chatId}`))


        const messageHandler = async (message: Message) => {
            let decryptedMessage = message

            if(message.senderId !== sessionId && message.nonce){
                const sessionKeys = getSessionKeys(chatId);
                if(sessionKeys){
                    try {
                        const decryptedText = await decryptMessage(message.text, sessionKeys.rx, message.nonce);
                        try {
                            const parsed = JSON.parse(decryptedText);
                            if (parsed && parsed.type === 'image') {
                                decryptedMessage = { ...message, imagePayload: parsed, text: '', imagePayloadNonce: message.nonce }
                            } else {
                                decryptedMessage = { ...message, text: decryptedText }
                            }
                        } catch {
                            decryptedMessage = { ...message, text: decryptedText }
                        }
                    } catch (error) {
                        console.error("Failed to decrypt message", error);
                        decryptedMessage = {...message, text: "[Unable to decrypt message]"}
                    }
                }
            }
            setMessages((prev) => {
                const existingIndex = prev.findIndex(m => m.id === decryptedMessage.id)
                if (existingIndex !== -1) {
                    // Preserve the text from optimistic message if it exists
                    const existingMsg = prev[existingIndex];
                    const isOptimistic = (existingMsg as any).isOptimistic;
                    if (isOptimistic && message.senderId === sessionId) {
                        // Keep the plaintext from optimistic message, update status
                        return prev.map(m => m.id === decryptedMessage.id ? { ...m, status: decryptedMessage.status || 'sent', isOptimistic: undefined } : m)
                    }
                    return prev.map(m => m.id === decryptedMessage.id ? { ...decryptedMessage, status: decryptedMessage.status || 'sent' } : m)
                }
                    
                if (decryptedMessage.senderId !== sessionId) {
                    return [decryptedMessage, ...prev]
                }
                return prev
            })
        }

        const updateHandler = (updatedMessage: Message) => {
            setMessages((prev) => prev.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
            ))
        }
        const statusHandler = ({ messageId, status }: { messageId: string; status: string }) => {
            setMessages((prev) => prev.map(msg => 
                msg.id === messageId ? { ...msg, status: status as Message['status'] } : msg
            ))
        }
        const typingHandler = ({ userId, isTyping }: { userId: string; userName: string; isTyping: boolean }) => {
           
            if (userId === chatPartner.id) {
                setIsPartnerTyping(isTyping)
            }
        }

        pusherClient.bind('incoming-message', messageHandler)
        pusherClient.bind('message-update', updateHandler)
        pusherClient.bind('message-status', statusHandler)
        pusherClient.bind('typing-indicator', typingHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
            pusherClient.unbind('incoming-message', messageHandler)
            pusherClient.unbind('message-update', updateHandler)
            pusherClient.unbind('message-status', statusHandler)
            pusherClient.unbind('typing-indicator', typingHandler)
        }
    }, [chatId, sessionId, chatPartner.id])

    return (
        <>
            {isDecrypting ? (
                <div className='flex-1 flex flex-col-reverse gap-4 p-4 overflow-y-auto'>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                <div className='w-8 h-8 rounded-full bg-slate-200 animate-pulse' />
                                <div className={`rounded-2xl p-4 ${i % 2 === 0 ? 'bg-sky-100' : 'bg-white/70'} animate-pulse`}>
                                    <div className='h-4 bg-slate-200 rounded w-32 mb-2' />
                                    <div className='h-3 bg-slate-200 rounded w-20' />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Messages 
                    initialMessages={messages}
                    sessionId={sessionId}
                    sessionImg={sessionImg}
                    chatPartner={chatPartner}
                    chatId={chatId}
                    friends={friends}
                    onReply={handleReply}
                />
            )}
            
            {isPartnerTyping && (
                <div className='px-8 pb-2'>
                    <div className='inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm border border-white/50 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                        <div className='flex items-center gap-1'>
                            <span className='w-2 h-2 bg-sky-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                            <span className='w-2 h-2 bg-sky-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
                            <span className='w-2 h-2 bg-sky-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className='text-xs text-slate-500 font-medium'>
                            {chatPartner.name.split(' ')[0]} is typing...
                        </span>
                    </div>
                </div>
            )}

            <ChatInput 
                chartPartener={chatPartner}
                chatId={chatId}
                sessionId={sessionId}
                onOptimisticMessage={addOptimisticMessage}
                replyingTo={replyingTo}
                onCancelReply={cancelReply}
            />
        </>
    )
}

export default ChatContainer
