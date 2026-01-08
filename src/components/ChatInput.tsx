"use client"

import { SendHorizontal, X, Reply } from 'lucide-react';
import React, { FC, useRef, useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from './ui/Button';
import axios from 'axios';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { Message, ReplyTo } from '@/lib/validations/message';
import { cn } from '@/lib/utils';

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
    const [sending, setSending] = useState<boolean>(false)
    const  [input, setInput] = useState<string>("");

    // Focus textarea when replying
    useEffect(() => {
        if (replyingTo) {
            textareaRef.current?.focus()
        }
    }, [replyingTo])
    
    const sendMessage = async () => {
        if(!input.trim()) return 
        setSending(true)
        
        const messageId = nanoid()
        const timestamp = Date.now()

        // Build replyTo data if replying
        const replyToData: ReplyTo | undefined = replyingTo ? {
            id: replyingTo.id,
            senderId: replyingTo.senderId,
            text: replyingTo.text.substring(0, 100), // Truncate long messages
            senderName: replyingTo.senderId === sessionId ? 'You' : chartPartener.name
        } : undefined
        
        // Create optimistic message with 'sending' status
        const optimisticMessage = {
            id: messageId,
            senderId: sessionId,
            text: input,
            timestamp,
            status: 'sending' as const,
            replyTo: replyToData
        }
        
        // Add optimistic message immediately
        onOptimisticMessage?.(optimisticMessage)
        
        const messageText = input
        setInput("");
        onCancelReply?.() // Clear reply state
        textareaRef.current?.focus()
        
        try {
            await axios.post('/api/message/send', {
                text: messageText, 
                chatId,
                messageId,
                timestamp,
                replyTo: replyToData
            })
            // Message status will be updated via Pusher
        } catch (error) {
            toast.error("Something went wrong. Please try again later")
            console.log(error)
        } finally {
            setSending(false)
        }
    }

  return (
    <div className='p-4 pb-6 mx-4 mb-2'>
        {/* Reply Preview */}
        {replyingTo && (
            <div className='mb-2 animate-in slide-in-from-bottom-2 duration-200'>
                <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-t-2xl rounded-b-lg px-4 py-3 border border-white/60 border-b-0'>
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

        <div className={cn(
            'relative flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 shadow-lg ring-1 ring-white/60 focus-within:ring-2 focus-within:ring-sky-200 focus-within:shadow-xl transition-all duration-300',
            replyingTo ? 'rounded-b-[32px] rounded-t-lg' : 'rounded-[32px]'
        )}>
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
            onChange={(e) => setInput(e.target.value)}
            placeholder={replyingTo ? 'Type your reply...' : `Message ${chartPartener.name.split(' ')[0]}...`}
            className='block w-full resize-none border-0 bg-transparent text-slate-800 placeholder:text-slate-400 focus:ring-0 py-3 px-4 text-sm sm:leading-6 max-h-32 overflow-y-auto scrollbar-none'
            />
            <div onClick={() => textareaRef.current?.focus()} 
            className=''
            aria-hidden= 'true' >
               
            </div>
            
            <div className="pr-1">
                 <Button onClick={sendMessage} type='submit' size='sm' className='rounded-full h-10 w-10 p-0 flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 shadow-lg shadow-sky-200' disabled={sending || !input.trim()}>
                    <SendHorizontal className="w-5 h-5 text-white ml-0.5" />
                </Button>
            </div>
           
        </div>
    </div>
  )
}

export default ChatInput
