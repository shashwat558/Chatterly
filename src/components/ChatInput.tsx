"use client"

import { SendHorizontal, X, Reply, Image as ImageIcon } from 'lucide-react';
import React, { FC, useRef, useState, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from './ui/Button';
import axios, { get } from 'axios';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { allowedImageTypes, MAX_IMAGE_LENGTH, Message, ReplyTo } from '@/lib/validations/message';
import { cn } from '@/lib/utils';
import { getSessionKeys, hasSessionKeys } from '@/lib/sessionKeys';
import { deriveSessionKeys } from '@/lib/encryption/keys';
import { useSession } from 'next-auth/react';
import { encryptMessage } from '@/lib/encryption/messageEncryption';

interface ChatInputProps {
    chartPartener : User
    chatId: string
    sessionId: string
    onOptimisticMessage?: (message: any) => void
    replyingTo?: Message | null
    onCancelReply?: () => void
}

const ChatInput:FC<ChatInputProps> = ({chartPartener, chatId, sessionId, onOptimisticMessage, replyingTo, onCancelReply}) => {
    
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const imgInputRef = useRef<HTMLInputElement | null>(null);
    const [sending, setSending] = useState<boolean>(false)
    const [input, setInput] = useState<string>("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageZoom, setImageZoom] = useState(1);
    const [imageRotation, setImageRotation] = useState(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isTypingRef = useRef(false)

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!allowedImageTypes.includes(file.type)) {
            toast.error('Please select a valid image type.');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_IMAGE_LENGTH) {
            toast.error(`Image must be ${(MAX_IMAGE_LENGTH / (1024 * 1024)).toFixed(1)}MB or smaller.`);
            e.target.value = '';
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        const url = URL.createObjectURL(file);
        setSelectedFile(file);
        setImagePreview(url);
        setInput('');
        setImageZoom(1);
        setImageRotation(0);
    };

    const removeImage = () => {
        setSelectedFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        if (imgInputRef.current) {
            imgInputRef.current.value = "";
        }
        setImageZoom(1);
        setImageRotation(0);
    };

    const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
        if (isTypingRef.current === isTyping) return // Avoid duplicate calls
        isTypingRef.current = isTyping
        
        try {
            await axios.post('/api/message/typing', { chatId, isTyping })
        } catch (error) {
            console.error('Failed to send typing indicator', error)
        }
    }, [chatId])

    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedFile) return; // image mode disables typing
        setInput(e.target.value)
        
        if (e.target.value.trim()) {
            sendTypingIndicator(true)
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingIndicator(false)
            }, 2000)
        } else {
            sendTypingIndicator(false)
        }
    }

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            if (isTypingRef.current) {
                axios.post('/api/message/typing', { chatId, isTyping: false }).catch(() => {})
            }
        }
    }, [chatId])

    
    useEffect(() => {
        if (replyingTo) {
            textareaRef.current?.focus()
        }
    }, [replyingTo])
    
    const sendMessage = async () => {
        const isImageMode = !!selectedFile;
        const textForSending = isImageMode ? '' : input;

        if(!textForSending.trim() && !selectedFile) return 
        setSending(true)
        const isSessionKeyAvailable = hasSessionKeys(chatId);
        if(!isSessionKeyAvailable) {
            const identityKeyResponse = await fetch(`/api/keys/identity?userId=${sessionId}`);
            const { identityKey: ourPublicKey } = await identityKeyResponse.json();
            const partnerIdentityKeyResponse = await fetch(`/api/keys/identity?userId=${chartPartener.id}`);
            const { identityKey: theirPublicKey } = await partnerIdentityKeyResponse.json();
            console.log("Our Public Key: ", ourPublicKey);
            console.log("Their Public Key: ", theirPublicKey);
            if(!ourPublicKey || !theirPublicKey) {
                toast.error("Encryption keys are missing. Cannot send message securely.")
                setSending(false)
                return;
            }
            try{
                await deriveSessionKeys(ourPublicKey, theirPublicKey, sessionId, chartPartener.id, chatId);


            } catch(error){
                toast.error("Failed to establish secure session. Please try again later.")
                setSending(false)
                return;
            }
        }

        const tx = getSessionKeys(chatId)?.tx;
        if(!tx){
            toast.error("Session keys are missing. Cannot send message securely.")
            setSending(false)
            return;
        };
        const cipherText = await encryptMessage(textForSending, tx);
        console.log("Cipher Text: ", cipherText.cipherText)
        console.log("Nonce: ", cipherText.nonce)
        
        const messageId = nanoid()
        const timestamp = Date.now()

        
        const replyToData: ReplyTo | undefined = replyingTo ? {
            id: replyingTo.id,
            senderId: replyingTo.senderId,
            text: replyingTo.text.substring(0, 100), // Truncate long messages
            senderName: replyingTo.senderId === sessionId ? 'You' : chartPartener.name
        } : undefined
        
        const optimisticMessage = {
            id: messageId,
            senderId: sessionId,
            text: textForSending,

            timestamp,
            status: 'sending' as const,
            replyTo: replyToData
        }
        
        onOptimisticMessage?.(optimisticMessage)
        
        const messageText = cipherText.cipherText
        
        // Reset Logic
        setInput("");
        removeImage();
        sendTypingIndicator(false) 
        onCancelReply?.() 
        textareaRef.current?.focus()
        
        try {
            await axios.post('/api/message/send', {
                text: messageText,
                nonce: cipherText.nonce, 
                chatId,
                messageId,
                timestamp,
                replyTo: replyToData
            })
            
        } catch (error) {
            toast.error("Something went wrong. Please try again later")
            console.log(error)
        } finally {
            setSending(false)
        }
    }

  return (
    <div className='p-4 pb-6 mx-4 mb-2'>
        <input 
            type="file" 
            ref={imgInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
            accept={allowedImageTypes.join(', ')}
        />

        {/* Reply Preview */}
        {replyingTo && (
            <div className='mb-2 animate-in slide-in-from-bottom-2 duration-200'>
                <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-t-2xl rounded-b-lg px-4 py-3 border border-white/60 border-b-0 shadow-sm'>
                    <div className='w-1 h-10 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full' />
                    <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-sky-600 flex items-center gap-1'>
                            <Reply className='w-3 h-3' />
                            Replying to {replyingTo.senderId === sessionId ? 'yourself' : chartPartener.name}
                        </p>
                        <p className='text-sm text-slate-500 truncate'>{replyingTo.text}</p>
                    </div>
                    <button 
                        onClick={onCancelReply}
                        className='p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors'
                    >
                        <X className='w-4 h-4' />
                    </button>
                </div>
            </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
             <div className='mb-3 animate-in slide-in-from-bottom-2 duration-200'>
                <div className='relative w-full max-w-xl group mx-auto'>
                    <div className='overflow-hidden rounded-2xl border-2 border-white shadow-xl bg-slate-50'>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className='w-full h-56 object-cover transition-transform duration-200'
                            style={{ transform: `scale(${imageZoom}) rotate(${imageRotation}deg)` }}
                        />
                    </div>
                    <button 
                        onClick={removeImage}
                        className='absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 border border-slate-100'
                        aria-label='Remove image'
                    >
                        <X className='w-4 h-4' />
                    </button>
                </div>
                <div className='mt-3 flex items-center gap-4 text-xs text-slate-500'>
                    <div className='flex-1'>
                        <label className='flex items-center gap-2 font-medium text-slate-600'>Zoom
                            <input 
                                type="range" 
                                min={0.75} 
                                max={1.5} 
                                step={0.05} 
                                value={imageZoom} 
                                onChange={(e) => setImageZoom(Number(e.target.value))}
                                className='w-full accent-sky-500'
                            />
                        </label>
                    </div>
                    <div className='flex-1'>
                        <label className='flex items-center gap-2 font-medium text-slate-600'>Rotate
                            <input 
                                type="range" 
                                min={0} 
                                max={360} 
                                step={5} 
                                value={imageRotation} 
                                onChange={(e) => setImageRotation(Number(e.target.value))}
                                className='w-full accent-sky-500'
                            />
                        </label>
                    </div>
                    <button 
                        onClick={() => { setImageZoom(1); setImageRotation(0); }}
                        className='px-3 py-2 rounded-full border text-slate-600 hover:text-slate-800 hover:border-slate-300 bg-white shadow-sm'
                        type='button'
                    >
                        Reset edits
                    </button>
                </div>
            </div>
        )}

        <div className={cn(
            'relative flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 shadow-lg ring-1 ring-white/60 focus-within:ring-2 focus-within:ring-sky-200 focus-within:shadow-xl transition-all duration-300',
            (replyingTo || imagePreview) ? 'rounded-b-[32px] rounded-t-lg' : 'rounded-[32px]'
        )}>
            <div className='pl-1'>
                 <button
                    onClick={() => imgInputRef.current?.click()}
                    className='p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors duration-200'
                    type='button'
                 >
                    <ImageIcon className='w-5 h-5' />
                 </button>
            </div>
            <TextareaAutosize ref={textareaRef} onKeyDown={(e) => {
                if(e.key === "Enter" && !e.shiftKey){
                    e.preventDefault()
                    sendMessage()
                }
                if(e.key === "Escape" && replyingTo){
                    onCancelReply?.()
                }
            }}
            rows={1}
            value={input}
            onChange={handleInputChange}
            disabled={!!selectedFile}
            placeholder={selectedFile ? 'Image selected — remove it to type a message' : (replyingTo ? 'Type your reply...' : `Message ${chartPartener.name.split(' ')[0]}...`)}
            className={cn(
                'block w-full resize-none border-0 bg-transparent text-slate-800 placeholder:text-slate-400 focus:ring-0 py-3 px-4 text-sm sm:leading-6 max-h-32 overflow-y-auto scrollbar-none',
                selectedFile && 'cursor-not-allowed opacity-70'
            )}
            />
            <div onClick={() => textareaRef.current?.focus()} 
            className=''
            aria-hidden= 'true' >
               
            </div>
            
            <div className="pr-1">
                 <Button onClick={sendMessage} type='submit' size='sm' className='rounded-full h-10 w-10 p-0 flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 shadow-lg shadow-sky-200' disabled={sending || (!input.trim() && !selectedFile)}>
                    <SendHorizontal className="w-5 h-5 text-white ml-0.5" />
                </Button>
            </div>
           
        </div>
    </div>
  )
}

export default ChatInput
