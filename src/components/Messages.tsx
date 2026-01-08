'use client'

import { cn, toPusherKey } from '@/lib/utils'
import { Message } from '@/lib/validations/message'
import React, { FC, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns';
import Image from 'next/image';
import { pusherClient } from '@/lib/pusher';
import { Smile } from 'lucide-react';
import axios from 'axios';

interface MessagesProps {
    initialMessages: Message[]
    sessionId: string
    sessionImg: string | null | undefined
    chatPartner : User,
    chatId: string
}

const REACTION_OPTIONS = ["👍", "❤️", "😊", "🙏", "✅"]

const Messages:FC<MessagesProps> = ({
    initialMessages,
    sessionId,
    sessionImg,
    chatPartner,
    chatId
}) => {
     const  [messages, setMessages] = useState<Message[]>(initialMessages)
     const [activePopover, setActivePopover] = useState<string | null>(null)


     useEffect(() => {
      pusherClient.subscribe(toPusherKey(`chat:${chatId}`))

      const messageHandler = (message: Message) => {
        setMessages((prev) => [message, ...prev])
      }

      const updateHandler = (updatedMessage: Message) => {
        setMessages((prev) => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
        ))
    }

      pusherClient.bind('incoming-message', messageHandler)
      pusherClient.bind('message-update', updateHandler)

      return () => {
        pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
        pusherClient.unbind('incoming-message', messageHandler)
        pusherClient.unbind('message-update', updateHandler)

      }

    },[chatId])

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formatTimestamp = (timestamp: number) => {
      return format(timestamp, "HH:mm")
    }
    
    const toggleReaction = async (message: Message, reaction: string) => {
        setActivePopover(null)
        
        // Optimistic Update
        const currentReactions = message.reactions || {}
        const myReactions = currentReactions[sessionId] || []

        let newMyReactions
        if(myReactions.includes(reaction)){
            newMyReactions = myReactions.filter(r => r !== reaction)
        } else {
            newMyReactions = [...myReactions, reaction]
        }
        
        const newReactions = { ...currentReactions }
        if(newMyReactions.length > 0){
            newReactions[sessionId] = newMyReactions
        } else {
            delete newReactions[sessionId]
        }

        setMessages(prev => prev.map(msg => 
            msg.id === message.id ? { ...msg, reactions: newReactions } : msg
        ))

        try {
            await axios.post('/api/message/reaction', {
                chatId,
                messageId: message.id,
                reaction,
                timestamp: message.timestamp
            })
        } catch (error) {
            console.error("Failed to react", error)
            // Revert could go here
        }
    }

  return (
    <div id='messages' className='flex h-full flex-1 flex-col-reverse gap-3 p-8 pt-24 overflow-y-auto scrollbar-thumb-rounded scrollbar-track-transparent scrollbar-w-2 scrolling-touch'>
        <div ref={scrollDownRef}/>

        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === sessionId

          const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId;
          
          const reactions = message.reactions || {}
          // Flatten reactions into a list of strings
          // Note: If you want to show WHO reacted, logic needs to be here. 
          // For now just showing labels.
          // Getting precise list of unique reactions or all reactions?
          // "Limit reactions to short calm acknowledgements" -> show all
          const flatReactions = Object.values(reactions).flat()

          return <div key={`${message.id}-${message.timestamp}`}
                      className='chat-message w-full animate-slide-up bg-transparent group' style={{ animationDuration: '0.3s' }}>
                        <div className={cn('flex items-end', {
                          'justify-end': isCurrentUser
                        })}>
                          <div className={cn('flex flex-col space-y-1 text-base max-w-sm mx-2 relative', {
                            'order-1 items-end': isCurrentUser,
                            'order-2 items-start': !isCurrentUser,
                          })}>
                             <div className={cn('px-5 py-3 inline-block rounded-[20px] backdrop-blur-sm shadow-sm', {
                              'bg-gradient-to-tr from-sky-400 to-blue-500 text-white shadow-sky-100': isCurrentUser,
                              'bg-white/80 text-slate-700 border border-white/60': !isCurrentUser,
                              'rounded-br-sm': !hasNextMessageFromSameUser && isCurrentUser,
                              'rounded-bl-sm': !hasNextMessageFromSameUser && !isCurrentUser,
                            })}>
                              {message.text}{' '}
                              <span className={cn('ml-2 text-[10px] align-bottom', {
                                'text-sky-100': isCurrentUser,
                                'text-slate-400': !isCurrentUser
                              })}>
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </div>
                            
                            {/* Reactions Display */}
                            {flatReactions.length > 0 && (
                                <div className={cn('flex flex-wrap gap-1 mt-1', {
                                    'justify-end': isCurrentUser,
                                    'justify-start': !isCurrentUser
                                })}>
                                    {flatReactions.map((r, i) => (
                                        <span key={`${r}-${i}`} className='px-2 py-0.5 bg-white/60 border border-white/40 rounded-full text-[10px] font-medium text-slate-600 shadow-sm animate-fade-in'>
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            )}

                             {/* Reaction Trigger Button - Below Message */}
                             <div className={cn('opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1', {
                                 'justify-end': isCurrentUser,
                                 'justify-start': !isCurrentUser
                             })}>
                                 <button 
                                    onClick={() => setActivePopover(activePopover === message.id ? null : message.id)}
                                    className='p-1.5 rounded-full bg-white/40 hover:bg-white/60 text-slate-500 hover:text-sky-500 transition-all'>
                                     <Smile className='w-4 h-4' />
                                 </button>
                                 
                                 {/* Popover */}
                                 {activePopover === message.id && (
                                    <div className='bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-white/50 flex gap-1 animate-in zoom-in-50 duration-200 z-20'>
                                        {REACTION_OPTIONS.map(opt => (
                                            <button 
                                                key={opt}
                                                onClick={() => toggleReaction(message, opt)}
                                                className='px-2 py-1 hover:bg-sky-100 rounded-full text-xs font-medium text-slate-700 transition-colors whitespace-nowrap'
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                 )}
                             </div>
                          </div>
                          
                          {/* Avatar */}
                          <div className={cn('relative h-8 w-8', {
                              'order-2': isCurrentUser,
                              'order-1': !isCurrentUser,
                              'invisible': hasNextMessageFromSameUser
                            })}>
                              {!isCurrentUser && (
                                <Image
                                src={chatPartner.image}
                                alt='Profile picture'
                                referrerPolicy='no-referrer'
                                className='rounded-full shadow-sm ring-1 ring-white'
                                width={32} 
                                height={32} 
                              />
                              )}
                            </div>
                          
                        </div>
                      </div>
        })}
        </div>
  )
}

export default Messages
