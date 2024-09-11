"use client"

import axios from 'axios'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { FC, useState } from 'react'

interface FreindRequetsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequest:FC<FreindRequetsProps> = ({
    incomingFriendRequests
}) => {
    const router = useRouter()
    const [friendRequests, setFriendRequest] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )

    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friend/accept', {id: senderId})

        setFriendRequest((prev) => prev.filter((request) =>request.senderId !==  senderId))
        router.refresh();
    }
    const denyFriend = async (senderId: string) => {
        await axios.post('/api/friend/deny', {id: senderId})

        setFriendRequest((prev) => prev.filter((request) =>request.senderId !==  senderId))
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