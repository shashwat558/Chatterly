"use client"

import { SendHorizontal } from 'lucide-react';
import React, { FC, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from './ui/Button';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ChatInputProps {
    chartPartener : User
    chatId: string
}

const ChatInput:FC<ChatInputProps> = ({chartPartener, chatId}) => {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [loading, setLoading] = useState<boolean>(false)
    const  [input, setInput] = useState<string>("");
    
    const sendMessage = async () => {
        if(!input) return 
        setLoading(true)
        try {
            await axios.post('/api/message/send', {text: input, chatId })
            setInput("");
            textareaRef.current?.focus()
            
        } catch (error) {
            toast.error("Something went wrong. Please try again later")
            console.log(error)
            
        } finally {
            setLoading(false)
        }
        
    }

  return (
    <div className='p-4 pb-6 mx-4 mb-2'>
        <div className='relative flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-[32px] p-2 shadow-lg ring-1 ring-white/60 focus-within:ring-2 focus-within:ring-sky-200 focus-within:shadow-xl transition-all duration-300'>
            <TextareaAutosize ref={textareaRef} onKeyDown={(e) => {
                if(e.key === "Return" && !e.shiftKey){
                    e.preventDefault()
                    sendMessage()
                }
            }}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${chartPartener.name.split(' ')[0]}...`}
            className='block w-full resize-none border-0 bg-transparent text-slate-800 placeholder:text-slate-400 focus:ring-0 py-3 px-4 text-sm sm:leading-6 max-h-32 overflow-y-auto scrollbar-none'
            />
            <div onClick={() => textareaRef.current?.focus()} 
            className=''
            aria-hidden= 'true' >
               
            </div>
            
            <div className="pr-1">
                 <Button isLoading={loading} onClick={sendMessage} type='submit' size='sm' className='rounded-full h-10 w-10 p-0 flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 shadow-lg shadow-sky-200'>
                    <SendHorizontal className="w-5 h-5 text-white ml-0.5" />
                </Button>
            </div>
           
        </div>
    </div>
  )
}

export default ChatInput
