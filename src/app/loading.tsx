import React from 'react'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <div className="relative">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 animate-bounce flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
