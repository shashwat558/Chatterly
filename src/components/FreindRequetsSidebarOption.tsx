'use client'

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import React, { FC, useEffect, useState } from 'react'

interface FreindRequetsSidebarOptionProps{
    initialUnseenRequestCount : number
    sessionId : string
}

const FreindRequetsSidebarOption: FC<FreindRequetsSidebarOptionProps> = ({
    initialUnseenRequestCount,
    sessionId
}) => {

    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )
    
    useEffect(() => {
        pusherClient.subscribe(
          toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        )
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))
    
        const friendRequestHandler = () => {
          setUnseenRequestCount((prev) => prev + 1)
        }
    
        const addedFriendHandler = () => {
          setUnseenRequestCount((prev) => prev - 1)
        }
    
        pusherClient.bind('incoming_friend_requests', friendRequestHandler)
        pusherClient.bind('new_friend', addedFriendHandler)
    
        return () => {
          pusherClient.unsubscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
          )
          pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
    
          pusherClient.unbind('new_friend', addedFriendHandler)
          pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
      }, [sessionId])



  return (
    <Link href='/dashboard/requests' className='text-white/90 hover:text-white hover:bg-white/30 group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all border border-transparent hover:border-white/40'>
        <div className='text-white/70 group-hover:text-sky-300 flex shrink-0 items-center justify-center'>
            <User className='h-5 w-5'/>
        </div>
        <p className='truncate'>Friend requests</p>
        
        {unseenRequestCount > 0 ? (
            <div className='bg-sky-500 font-bold text-[0.625rem] text-white px-2 py-0.5 rounded-full ml-auto shadow-md'>
                {unseenRequestCount}
            </div>
        ): null}
        
    </Link>
  )
}

export default FreindRequetsSidebarOption
