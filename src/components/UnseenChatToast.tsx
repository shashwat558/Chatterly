import { chatHrefConstructor, cn } from '@/lib/utils'
import Image from 'next/image'
import React, { FC } from 'react'
import toast, { Toast } from 'react-hot-toast'

type Props = {
    t: Toast,
    sessionId: string
    senderId: string
    senderImg: string
    senderName: string
    senderMessage: string
}

const UnseenChatToast:FC<Props> = ({t, senderId, sessionId, senderImg, senderName, senderMessage}) => {
  return (
    <div className={cn('max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
        {'animate-enter': t.visible,
            'animate-leave': !t.visible
        }
    )}>
        <a onClick={() => toast.dismiss(t.id)} href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`} className='flex-1 w-0 p-4'>
            <div className='flex items-start'>
                <div className='flex-shrink-0 pt-0.5'>
                    <div className='relative h-10 w-10'>
                        <Image fill referrerPolicy='no-referrer' src={senderImg} alt={`${senderName} Profile picture`}/>
                    </div>
                </div>
                <div className='ml-3 flex-1'>
                    <p className='text-sm font-medium text-gray-900'>{senderName}</p>
                    <p className='mt-1 text-sm text-gray-500'>{senderMessage}</p>
                </div>
            </div>
            
        </a>
        <div className='flex border-1 border-gray-200'>
                <button onClick={() => toast.dismiss(t.id)} className='w-full border border-transparent rounded-none rounded-r-lg flex items-center justify-center text-center text-indigo-300 hover:text-indigo-500'>
                    close
                </button>
            </div>
        
        
    </div>
  )
}

export default UnseenChatToast