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
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [replyingTo, setReplyingTo] = useState<Message | null>(null)
    const [isPartnerTyping, setIsPartnerTyping] = useState(false)

    const addOptimisticMessage = useCallback((message: Message) => {
        setMessages((prev) => [message, ...prev])
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
                const partnerIdentityKey = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:${chatPartner.id}:identity_key`, {
         headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            cache: 'no-store',
    });
            const {result: theirPublicKey} = await partnerIdentityKey.text().then(text => JSON.parse(text));
            await deriveSessionKeys(ourPublicKey, theirPublicKey, sessionId, chatPartner.id, chatId);
            };
            console.log("Session keys derived for chat:", chatId);
        }
        deriveKeys();
    }, [chatId, chatPartner.id, sessionId])

    
    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`chat:${chatId}`))


        const messageHandler = async (message: Message) => {
            let decryptedMessage = message

            if(message.senderId !== sessionId && message.nonce){
                const sessionKeys = getSessionKeys(chatId);
                if(sessionKeys){
                    try {
                        const decryptedText = await decryptMessage(message.text, sessionKeys.rx, message.nonce);
                        decryptedMessage = {...message, text: decryptedText}
                    } catch (error) {
                        console.error("Failed to decrypt message", error);
                        decryptedMessage = {...message, text: "[Unable to decrypt message]"}
                    }
                }
            }
            setMessages((prev) => {
                const existingIndex = prev.findIndex(m => m.id === decryptedMessage.id)
                if (existingIndex !== -1) {
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
            <Messages 
                initialMessages={messages}
                sessionId={sessionId}
                sessionImg={sessionImg}
                chatPartner={chatPartner}
                chatId={chatId}
                friends={friends}
                onReply={handleReply}
            />
            
            {/* Typing Indicator */}
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
