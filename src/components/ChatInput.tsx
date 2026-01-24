"use client"

import { SendHorizontal, X, Reply, Image as ImageIcon } from 'lucide-react';
import React, { FC, useRef, useState, useEffect, useCallback } from 'react';
import Button from './ui/Button';
import axios, { get } from 'axios';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { allowedImageTypes, ImageMessagePayload, MAX_IMAGE_LENGTH, Message, ReplyTo } from '@/lib/validations/message';
import { cn } from '@/lib/utils';
import { getSessionKeys, hasSessionKeys } from '@/lib/sessionKeys';
import { deriveSessionKeys } from '@/lib/encryption/keys';
import { useSession } from 'next-auth/react';
import { encryptImage, encryptData } from '@/lib/encryption/messageEncryption';
import imageCompression from "browser-image-compression";
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
        if (isTypingRef.current === isTyping) return
        isTypingRef.current = isTyping
        
        try {
            await axios.post('/api/message/typing', { chatId, isTyping })
        } catch (error) {
            console.error('Failed to send typing indicator', error)
        }
    }, [chatId])

    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedFile) return;
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
        
        if(!textForSending.trim() && !selectedFile) return;
        
        setSending(true);
        
        try {
            await ensureSessionKeys();
            
            let imageUrl: string | undefined;
            let optimisticImagePayload: ImageMessagePayload | undefined;
            let encryptedData: { cipherText: string; nonce: string } | null = null;
            
            if (isImageMode && selectedFile) {
                const uploadResult = await handleImageUpload(selectedFile);
                if (!uploadResult) {
                    setSending(false);
                    return;
                }
                imageUrl = uploadResult.imageUrl;
                optimisticImagePayload = uploadResult.imagePayload;
                encryptedData = uploadResult.encryptedPayload;
            } else {
                encryptedData = await encryptMessageText(textForSending);
                if (!encryptedData) {
                    setSending(false);
                    return;
                }
            }
            
            const { messageId, timestamp, replyToData, optimisticMessage } = prepareMessageData(
                textForSending,
                imageUrl,
                optimisticImagePayload
            );
            
            onOptimisticMessage?.(optimisticMessage);
            
            resetInputState();
            await sendMessageToServer({
                text: encryptedData.cipherText,
                nonce: encryptedData.nonce,
                chatId,
                messageId,
                timestamp,
                replyTo: replyToData,
                imageUrl
            });
            
        } catch (error) {
            toast.error("Something went wrong. Please try again later");
            console.error(error);
        } finally {
            setSending(false);
        }
    };
    const ensureSessionKeys = async () => {
        const isSessionKeyAvailable = hasSessionKeys(chatId);
        if (isSessionKeyAvailable) return;
        
        const identityKeyResponse = await fetch(`/api/keys/identity?userId=${sessionId}`);
        const { identityKey: ourPublicKey } = await identityKeyResponse.json();
        
        const partnerIdentityKeyResponse = await fetch(`/api/keys/identity?userId=${chartPartener.id}`);
        const { identityKey: theirPublicKey } = await partnerIdentityKeyResponse.json();
        
        if (!ourPublicKey || !theirPublicKey) {
            throw new Error("Encryption keys are missing. Cannot send message securely.");
        }
        
        await deriveSessionKeys(ourPublicKey, theirPublicKey, sessionId, chartPartener.id, chatId);
    };
    const handleImageUpload = async (file: File): Promise<{ imageUrl: string; imagePayload: ImageMessagePayload; encryptedPayload: { cipherText: string; nonce: string } } | undefined> => {
        try {
            const compressedImage = await imageCompression(file, {
                maxSizeMB: MAX_IMAGE_LENGTH / (1024 * 1024),
                maxWidthOrHeight: 1920,
                useWebWorker: true
            });
            
            console.log('Compressed image size:', `${(compressedImage.size / 1024 / 1024).toFixed(2)} MB`);
            const buffer = await compressedImage.arrayBuffer();
            const imageBytes = new Uint8Array(buffer);
            
            const sessionKeys = getSessionKeys(chatId);
            if (!sessionKeys) {
                toast.error("Session keys are missing. Cannot send image securely.");
                return undefined;
            }
            
            const encryptedImageData = await encryptImage(imageBytes);
            
            const uploadUrlResponse = await fetch('/api/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId })
            });
            
            if (!uploadUrlResponse.ok) {
                toast.error("Failed to get upload URL. Please try again later.");
                return undefined;
            }
            
            const { uploadUrl, objectKey } = await uploadUrlResponse.json();
            
            
            await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: Uint8Array.from(atob(encryptedImageData.encryptedImage), c => c.charCodeAt(0))
            });
            
            const imagePayload: ImageMessagePayload = {
                type: "image",
                url: uploadUrl.split('?')[0],
                nonce: encryptedImageData.nonce,
                fileKey: encryptedImageData.fileKey,
                size: file.size,
                objectKey
            };
            const encryptedImageMessage = await encryptData(imagePayload, sessionKeys.tx);
            
            console.log("Encrypted Image Message:", encryptedImageMessage.cipherText);
            console.log("Nonce for Image Message:", encryptedImageMessage.nonce);
            
            return { 
                imageUrl: uploadUrl.split('?')[0], 
                imagePayload, 
                encryptedPayload: encryptedImageMessage 
            };
            
        } catch (error) {
            toast.error("Failed to upload image. Please try again later.");
            console.error(error);
            return undefined;
        }
        
    };
    
    const encryptMessageText = async (text: string) => {
        const tx = getSessionKeys(chatId)?.tx;
        if (!tx) {
            toast.error("Session keys are missing. Cannot send message securely.");
            return null;
        }
        
        const cipherText = await encryptData(text, tx);
        console.log("Cipher Text:", cipherText.cipherText);
        console.log("Nonce:", cipherText.nonce);
        
        return cipherText;
    };
    
    const prepareMessageData = (text: string, imageUrl?: string, imagePayload?: ImageMessagePayload) => {
        const messageId = nanoid();
        const timestamp = Date.now();
        
        const replyToData: ReplyTo | undefined = replyingTo ? {
            id: replyingTo.id,
            senderId: replyingTo.senderId,
            text: replyingTo.text.substring(0, 100),
            senderName: replyingTo.senderId === sessionId ? 'You' : chartPartener.name
        } : undefined;
        
        const optimisticMessage = {
            id: messageId,
            senderId: sessionId,
            text,
            imageUrl,
            imagePayload,
            timestamp,
            status: 'sending' as const,
            replyTo: replyToData
        };
        
        return { messageId, timestamp, replyToData, optimisticMessage };
    };
    
    
    const resetInputState = () => {
        setInput("");
        removeImage();
        sendTypingIndicator(false);
        onCancelReply?.();
        textareaRef.current?.focus();
    };

    const sendMessageToServer = async (payload: any) => {
        await axios.post('/api/message/send', payload);
    };

  return (
    <div className='p-4 pb-6 mx-4 mb-2'>
        <input 
            type="file" 
            ref={imgInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
            accept={allowedImageTypes.join(', ')}
        />

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
            <textarea ref={textareaRef} onKeyDown={(e) => {
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
