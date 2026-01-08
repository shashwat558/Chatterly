"use client"

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { Check, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'
import Button from './ui/Button'

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
  
      const friendRequestHandler = ({
        senderId,
        senderEmail,
      }: IncomingFriendRequest) => {
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
      {friendRequests.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-4 border border-sky-100">
                <User className="h-10 w-10 text-sky-300" />
            </div>
             <p className='text-lg text-slate-600 font-medium'>No pending requests</p>
             <p className='text-sm text-slate-400 mt-1'>When someone sends you a request, it will appear here</p>
        </div>
       

      ): (
        friendRequests.map((request) => (
            <div key={request.senderId} className='flex gap-4 items-center justify-between py-4 px-6 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300'>
                <div className='flex items-center gap-4'>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {request.senderEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col'>
                      <p className='font-semibold text-slate-800'>{request.senderEmail}</p>
                      <p className='text-xs text-slate-500'>Wants to connect with you</p>
                    </div>
                </div>
               
                <div className='flex items-center gap-2'>
                     <button onClick={() => acceptFriend(request.senderId)} aria-label='accept friend' className='px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg'>
                         <Check className='w-4 h-4' />
                         Accept
                    </button>
                    <button onClick={() => denyFriend(request.senderId)} aria-label='deny friend' className='w-10 h-10 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white grid place-items-center transition-all text-slate-400 border border-slate-200 hover:border-red-500'>
                        <X className='w-4 h-4'/>
                    </button>
                </div>
               

            </div>
        ))
      )}
    </>
  )
}

export default FriendRequest
