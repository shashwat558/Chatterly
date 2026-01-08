"use client"

import { pusherClient } from '@/lib/pusher';
import { chatHrefConstructor, cn, toPusherKey } from '@/lib/utils';

import { usePathname, useRouter } from 'next/navigation';
import React, { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import UnseenChatToast from './UnseenChatToast';

interface SideBarChatListProps{
    friends: User[]
    sessionId: string
}

interface ExtendMessage extends Message{
    senderId: string
    senderImage: string
    senderName: string
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
                <UnseenChatToast t={t} sessionId={sessionId} senderId={message.senderId} senderName={message.senderName} senderImg={message.senderImage} senderMessage={message.text} />
            ))

            setUnseenMessages((prev) => [...prev, message])
        }

        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', friendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

        }

    },[sessionId, pathname, router])

    useEffect(() => {
        if(pathname?.includes('chat')){
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])
   return (
    <ul role='list' className='max-h-[25rem] overflow-y-auto space-y-1 p-1'>
        {friends.sort().map((friend) => {
            const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                return unseenMsg.senderId === friend.id
            }).length

            const isActive = pathname === `/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`;

            return <li key={friend.id}>
                <a
                 className={cn('group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200 border', {
                    'bg-white/90 text-sky-600 shadow-md border-white/70': isActive,
                    'text-white/90 hover:text-white hover:bg-white/30 border-transparent hover:border-white/40': !isActive
                 })}
                 href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>
                  <div className="truncate flex-1">
                     {friend.name}
                  </div>
               
                {unseenMessagesCount > 0 ? (
                    <div className='bg-sky-500 font-bold text-[0.625rem] text-white px-2 py-0.5 rounded-full ml-auto shadow-md'>
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
