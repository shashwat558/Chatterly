'use client'

import { cn } from '@/lib/utils'
import { Message } from '@/lib/validations/message'
import React, { FC, useEffect, useRef, useState } from 'react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import Image from 'next/image';
import { Bookmark, Smile, Check, CheckCheck, Clock, Forward, X, Reply } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface MessagesProps {
    initialMessages: Message[]
    sessionId: string
    sessionImg: string | null | undefined
    chatPartner : User,
    chatId: string
    friends?: User[]
    onReply?: (message: Message) => void
}

const REACTION_OPTIONS = ["👍", "❤️", "😊", "🙏", "✅"]

// Status tick component
const MessageStatus: FC<{ status?: string; isCurrentUser: boolean }> = ({ status, isCurrentUser }) => {
    if (!isCurrentUser) return null
    
    const baseClass = 'ml-1 inline-flex items-center'
    
    switch (status) {
        case 'sending':
            return (
                <span className={cn(baseClass, 'text-sky-200')}>
                    <Clock className='w-3 h-3' />
                </span>
            )
        case 'sent':
            return (
                <span className={cn(baseClass, 'text-sky-200')}>
                    <Check className='w-3 h-3' />
                </span>
            )
        case 'delivered':
            return (
                <span className={cn(baseClass, 'text-sky-200')}>
                    <CheckCheck className='w-3 h-3' />
                </span>
            )
        case 'seen':
            return (
                <span className={cn(baseClass, 'text-sky-100')}>
                    <CheckCheck className='w-3.5 h-3.5 stroke-[2.5]' />
                </span>
            )
        default:
            // Default to sent if no status (for older messages)
            return (
                <span className={cn(baseClass, 'text-sky-200')}>
                    <CheckCheck className='w-3 h-3' />
                </span>
            )
    }
}

const Messages:FC<MessagesProps> = ({
    initialMessages,
    sessionId,
    sessionImg,
    chatPartner,
    chatId,
    friends = [],
    onReply
}) => {
     const  [messages, setMessages] = useState<Message[]>(initialMessages)
     const [activePopover, setActivePopover] = useState<string | null>(null)
     const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
     const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
     const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set())
     const [isForwarding, setIsForwarding] = useState(false)

     // Update messages when initialMessages changes (for optimistic updates from parent)
     useEffect(() => {
       setMessages(initialMessages)
     }, [initialMessages])

     // Fetch bookmarks on mount
     useEffect(() => {
       const fetchBookmarks = async () => {
         try {
           const res = await axios.get('/api/message/bookmark')
           const bookmarks = res.data as any[]
           setBookmarkedIds(new Set(bookmarks.map(b => b.messageId)))
         } catch (error) {
           console.error('Failed to fetch bookmarks', error)
         }
       }
       fetchBookmarks()
     }, [])

    // Mark messages as seen when viewing
    useEffect(() => {
      const markAsSeen = async () => {
        // Find messages from chat partner that aren't seen yet
        const unseenMessages = messages.filter(
          msg => msg.senderId !== sessionId && msg.status !== 'seen'
        )
        
        if (unseenMessages.length > 0) {
          try {
            await axios.post('/api/message/seen', {
              chatId,
              messageIds: unseenMessages.map(m => m.id)
            })
          } catch (error) {
            console.error('Failed to mark messages as seen', error)
          }
        }
      }
      
      // Debounce the seen marking
      const timer = setTimeout(markAsSeen, 500)
      return () => clearTimeout(timer)
    }, [messages, chatId, sessionId])

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formatTimestamp = (timestamp: number) => {
      return format(timestamp, "HH:mm")
    }

    const getSessionLabel = (timestamp: number): string => {
      const date = new Date(timestamp)
      if (isToday(date)) return 'Today'
      if (isYesterday(date)) return 'Yesterday'
      if (isThisWeek(date)) return format(date, 'EEEE') // e.g., "Monday"
      if (isThisMonth(date)) return 'Earlier this month'
      return format(date, 'MMMM yyyy') // e.g., "December 2025"
    }

    // Group messages by session (reversed since messages are newest first)
    const getMessageSession = (message: Message, prevMessage: Message | undefined): string | null => {
      const currentLabel = getSessionLabel(message.timestamp)
      if (!prevMessage) return currentLabel
      const prevLabel = getSessionLabel(prevMessage.timestamp)
      return currentLabel !== prevLabel ? currentLabel : null
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

    const toggleBookmark = async (message: Message) => {
        const isCurrentlyBookmarked = bookmarkedIds.has(message.id)
        
        // Optimistic update
        setBookmarkedIds(prev => {
            const newSet = new Set(prev)
            if (isCurrentlyBookmarked) {
                newSet.delete(message.id)
            } else {
                newSet.add(message.id)
            }
            return newSet
        })

        try {
            await axios.post('/api/message/bookmark', {
                chatId,
                messageId: message.id,
                text: message.text,
                timestamp: message.timestamp,
                senderId: message.senderId
            })
        } catch (error) {
            console.error("Failed to bookmark", error)
            // Revert
            setBookmarkedIds(prev => {
                const newSet = new Set(prev)
                if (isCurrentlyBookmarked) {
                    newSet.add(message.id)
                } else {
                    newSet.delete(message.id)
                }
                return newSet
            })
        }
    }

    const openForwardModal = (message: Message) => {
        setForwardingMessage(message)
        setSelectedFriends(new Set())
    }

    const closeForwardModal = () => {
        setForwardingMessage(null)
        setSelectedFriends(new Set())
    }

    const toggleFriendSelection = (friendId: string) => {
        setSelectedFriends(prev => {
            const newSet = new Set(prev)
            if (newSet.has(friendId)) {
                newSet.delete(friendId)
            } else {
                newSet.add(friendId)
            }
            return newSet
        })
    }

    const handleForward = async () => {
        if (!forwardingMessage || selectedFriends.size === 0) return
        
        setIsForwarding(true)
        try {
            await axios.post('/api/message/forward', {
                text: forwardingMessage.text,
                targetFriendIds: Array.from(selectedFriends)
            })
            toast.success(`Message forwarded to ${selectedFriends.size} friend${selectedFriends.size > 1 ? 's' : ''}`)
            closeForwardModal()
        } catch (error) {
            console.error("Failed to forward", error)
            toast.error("Failed to forward message")
        } finally {
            setIsForwarding(false)
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

          // Session header logic (shows AFTER the message since list is reversed)
          const sessionLabel = getMessageSession(message, messages[index + 1])

          return (
            <React.Fragment key={`${message.id}-${message.timestamp}`}>
              <div className='chat-message w-full animate-slide-up bg-transparent group' style={{ animationDuration: '0.3s' }}>
                        <div className={cn('flex items-end', {
                          'justify-end': isCurrentUser
                        })}>
                          <div className={cn('flex flex-col space-y-1 text-base max-w-sm mx-2 relative', {
                            'order-1 items-end': isCurrentUser,
                            'order-2 items-start': !isCurrentUser,
                          })}>
                             {/* Reply Preview - shows what message this is replying to */}
                             {message.replyTo && (
                               <div 
                                 className={cn(
                                   'px-3 py-2 rounded-t-[16px] rounded-b-md text-xs max-w-full cursor-pointer hover:opacity-80 transition-opacity',
                                   isCurrentUser 
                                     ? 'bg-sky-500/30 border border-sky-400/30' 
                                     : 'bg-slate-100/80 border border-slate-200/60'
                                 )}
                                 onClick={() => {
                                   // Scroll to original message
                                   const element = document.getElementById(`message-${message.replyTo?.id}`)
                                   element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                   element?.classList.add('ring-2', 'ring-sky-400')
                                   setTimeout(() => element?.classList.remove('ring-2', 'ring-sky-400'), 2000)
                                 }}
                               >
                                 <p className={cn('font-semibold mb-0.5 flex items-center gap-1', {
                                   'text-sky-100': isCurrentUser,
                                   'text-sky-600': !isCurrentUser
                                 })}>
                                   <Reply className='w-3 h-3' />
                                   {message.replyTo.senderName || (message.replyTo.senderId === sessionId ? 'You' : chatPartner.name)}
                                 </p>
                                 <p className={cn('truncate', {
                                   'text-sky-200': isCurrentUser,
                                   'text-slate-500': !isCurrentUser
                                 })}>
                                   {message.replyTo.text}
                                 </p>
                               </div>
                             )}

                             <div 
                              id={`message-${message.id}`}
                              className={cn('px-5 py-3 inline-block backdrop-blur-sm shadow-sm transition-all duration-300', {
                              'bg-gradient-to-tr from-sky-400 to-blue-500 text-white shadow-sky-100': isCurrentUser,
                              'bg-white/80 text-slate-700 border border-white/60': !isCurrentUser,
                              'rounded-[20px]': !message.replyTo,
                              'rounded-b-[20px] rounded-t-md': message.replyTo,
                              'rounded-br-sm': !hasNextMessageFromSameUser && isCurrentUser && !message.replyTo,
                              'rounded-bl-sm': !hasNextMessageFromSameUser && !isCurrentUser && !message.replyTo,
                              'opacity-70': message.status === 'sending'
                            })}>
                              {message.text}{' '}
                              <span className={cn('ml-2 text-[10px] align-bottom inline-flex items-center gap-0.5', {
                                'text-sky-100': isCurrentUser,
                                'text-slate-400': !isCurrentUser
                              })}>
                                {formatTimestamp(message.timestamp)}
                                <MessageStatus status={message.status} isCurrentUser={isCurrentUser} />
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
                                 {/* Reply Button */}
                                 <button 
                                    onClick={() => onReply?.(message)}
                                    className='p-1.5 rounded-full bg-white/40 hover:bg-white/60 text-slate-500 hover:text-sky-500 transition-all'>
                                     <Reply className='w-4 h-4' />
                                 </button>

                                 <button 
                                    onClick={() => setActivePopover(activePopover === message.id ? null : message.id)}
                                    className='p-1.5 rounded-full bg-white/40 hover:bg-white/60 text-slate-500 hover:text-sky-500 transition-all'>
                                     <Smile className='w-4 h-4' />
                                 </button>

                                 {/* Bookmark Button */}
                                 <button 
                                    onClick={() => toggleBookmark(message)}
                                    className={cn('p-1.5 rounded-full transition-all', {
                                        'bg-amber-100 text-amber-500': bookmarkedIds.has(message.id),
                                        'bg-white/40 hover:bg-white/60 text-slate-500 hover:text-amber-500': !bookmarkedIds.has(message.id)
                                    })}>
                                     <Bookmark className={cn('w-4 h-4', {
                                        'fill-amber-500': bookmarkedIds.has(message.id)
                                     })} />
                                 </button>

                                 {/* Forward Button */}
                                 {friends.length > 0 && (
                                   <button 
                                      onClick={() => openForwardModal(message)}
                                      className='p-1.5 rounded-full bg-white/40 hover:bg-white/60 text-slate-500 hover:text-sky-500 transition-all'>
                                       <Forward className='w-4 h-4' />
                                   </button>
                                 )}
                                 
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

              {/* Session Header - appears after message group in reversed list */}
              {sessionLabel && (
                <div className='flex items-center justify-center my-6'>
                  <div className='flex items-center gap-3 w-full max-w-xs'>
                    <div className='flex-1 h-px bg-slate-200/50' />
                    <span className='text-[11px] font-medium text-slate-400 uppercase tracking-wider'>
                      {sessionLabel}
                    </span>
                    <div className='flex-1 h-px bg-slate-200/50' />
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        })}

        {/* Forward Modal */}
        {forwardingMessage && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4' onClick={closeForwardModal}>
            <div className='bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200' onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className='flex items-center justify-between p-5 border-b border-slate-100'>
                <h3 className='text-lg font-semibold text-slate-800'>Forward Message</h3>
                <button onClick={closeForwardModal} className='p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors'>
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Message Preview */}
              <div className='px-5 py-4 bg-sky-50/50'>
                <p className='text-sm text-slate-500 mb-2'>Message:</p>
                <p className='text-slate-700 bg-white/80 px-4 py-3 rounded-2xl border border-white/60 shadow-sm line-clamp-3'>
                  {forwardingMessage.text}
                </p>
              </div>

              {/* Friends List */}
              <div className='p-5'>
                <p className='text-sm font-medium text-slate-600 mb-3'>Select friends to forward to:</p>
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  {friends.filter(f => f.id !== chatPartner.id).map(friend => (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriendSelection(friend.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                        selectedFriends.has(friend.id) 
                          ? 'bg-sky-100 ring-2 ring-sky-300' 
                          : 'bg-slate-50 hover:bg-slate-100'
                      )}
                    >
                      <Image
                        src={friend.image}
                        alt={friend.name}
                        width={40}
                        height={40}
                        className='rounded-full'
                        referrerPolicy='no-referrer'
                      />
                      <div className='flex-1 text-left'>
                        <p className='font-medium text-slate-800'>{friend.name}</p>
                        <p className='text-xs text-slate-500 truncate'>{friend.email}</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedFriends.has(friend.id)
                          ? 'bg-sky-500 border-sky-500'
                          : 'border-slate-300'
                      )}>
                        {selectedFriends.has(friend.id) && <Check className='w-3 h-3 text-white' />}
                      </div>
                    </button>
                  ))}
                  {friends.filter(f => f.id !== chatPartner.id).length === 0 && (
                    <p className='text-center text-slate-400 py-8'>No other friends to forward to</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className='p-5 border-t border-slate-100 flex gap-3'>
                <button
                  onClick={closeForwardModal}
                  className='flex-1 py-3 px-4 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleForward}
                  disabled={selectedFriends.size === 0 || isForwarding}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-full font-medium transition-all flex items-center justify-center gap-2',
                    selectedFriends.size > 0 && !isForwarding
                      ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-200 hover:shadow-xl'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  )}
                >
                  {isForwarding ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Forwarding...
                    </>
                  ) : (
                    <>
                      <Forward className='w-4 h-4' />
                      Forward {selectedFriends.size > 0 && `(${selectedFriends.size})`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
  )
}

export default Messages
