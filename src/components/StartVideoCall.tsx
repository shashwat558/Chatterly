"use client"
import { VideoCameraIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { pusherClient } from '@/lib/pusher'

const StartVideoCall = ({}) => {
   const handleStartCall = async() => {
     // Logic to start a video call can be added here
     await fetch('/api/video-call/start', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ /* any necessary data */ })
     })
     
   }
    
    
  return (
    <button
                type='button'
                className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow-md hover:bg-sky-600 active:scale-[0.99] transition'
                 onClick={handleStartCall}
                aria-label='Start video call'
              >
                <VideoCameraIcon className='w-4 h-4' />
                Start call
              </button>
  )
}

export default StartVideoCall;