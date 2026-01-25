"use client"
import { VideoCameraIcon } from '@heroicons/react/24/outline'
import React from 'react'

const StartVideoCall = () => {
    
    
  return (
    <button
                type='button'
                className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow-md hover:bg-sky-600 active:scale-[0.99] transition'
                 onClick={() => {
                   console.log('Start video call')
                 }}
                aria-label='Start video call'
              >
                <VideoCameraIcon className='w-4 h-4' />
                Start call
              </button>
  )
}

export default StartVideoCall