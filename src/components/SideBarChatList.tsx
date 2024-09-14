"use client"

import { pusherClient } from '@/lib/pusher';
import { chatHrefConstructor, toPusherKey } from '@/lib/utils';

import { usePathname, useRouter } from 'next/navigation';
import React, { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SideBarChatListProps{
    friends: User[]
    sessionId: string
}

interface ExtendMessage extends Message{
    senderId: string
    senderImage: string
}

const SideBarChatList: FC<SideBarChatListProps> = ({friends, sessionId}) => {
    const router = useRouter();
    const pathname = usePathname();
    const  [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const friendHandler = () => {
            router.refresh()
        }
        const chatHandler = (message: ExtendMessage) => {
            const shoudlNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if(!shoudlNotify) return

            toast.custom((t) => (
                
            ))
        }

        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', friendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

        }

    })

    useEffect(() => {
        if(pathname?.includes('chat')){
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])
  return (
    <ul role='list' className='max-h-[25rem] overflow-auto -mx-2 space-y-2'>
        {friends.sort().map((friend) => {
            const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                return unseenMsg.senderId = friend.id
            }).length
            return <li key={friend.id}>
                <a
                 className='text-gray-700 hover:text-indigo-600 hover:bg-gray-100 group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                 href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>
                {friend.name}
                {unseenMessagesCount > 0 ? (
                    <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 justify-center items-center'>
                        {unseenMessagesCount}
                    </div>
                ):null}
                </a>
              
            </li>;
            
        })}
    </ul>
  )
}

export default SideBarChatList;