"use client"

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'

interface FreindRequetsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequest:FC<FreindRequetsProps> = ({
    incomingFriendRequests, sessionId
}) => {
    const router = useRouter()
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )

    useEffect(() => {
      pusherClient.subscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      console.log("listening to ", `user:${sessionId}:incoming_friend_requests`)
  
      const friendRequestHandler = ({
        senderId,
        senderEmail,
      }: IncomingFriendRequest) => {
        console.log("function got called")
        setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
      }
  
      pusherClient.bind('incoming_friend_requests', friendRequestHandler)
  
      return () => {
        pusherClient.unsubscribe(
          toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        )
        pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
      }
    }, [sessionId])

    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friend/accept', {id: senderId})

        setFriendRequests((prev) => prev.filter((request) =>request.senderId !==  senderId))
        router.refresh();
    }
    const denyFriend = async (senderId: string) => {
        await axios.post('/api/friend/deny', {id: senderId})

        setFriendRequests((prev) => prev.filter((request) =>request.senderId !==  senderId))
        router.refresh();
    }
    
    



  return (
    <>
      {FriendRequest.length === 0 ? (
        <p className='text-sm text-zinc-900'>Nothing to show here... </p>

      ): (
        friendRequests.map((request) => (
            <div key={request.senderId} className='flex gap-4 items-center'>
                <UserPlus  className='text-black' />
                <p className='font-medium text-lg'>{request.senderEmail}</p>
                <button onClick={() => acceptFriend(request.senderId)} aria-label='accept friend' className='w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 grid place-items-center transition hover:shadow-md'>
                    <Check className='font-semibold  text-white w-3/4 h-3/4' />
                </button>
                <button onClick={() => denyFriend(request.senderId)} aria-label='deny friend' className='w-8 h-8 rounded-full bg-red-600 hover:bg-indigo-700 grid place-items-center transition hover:shadow-md'>
                    <X className='font-semibold  text-white w-3/4 h-3/4'/>
                </button>

            </div>
        ))
      )}
    </>
  )
}

export default FriendRequest