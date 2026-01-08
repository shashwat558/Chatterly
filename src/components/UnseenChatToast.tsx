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
    <div className={cn('max-w-md w-full glass-card p-0 pointer-events-auto flex',
        {'animate-enter': t.visible,
            'animate-leave': !t.visible
        }
    )}>
        <a onClick={() => toast.dismiss(t.id)} href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`} className='flex-1 w-0 p-4'>
            <div className='flex items-start'>
                <div className='flex-shrink-0 pt-0.5'>
                    <div className='relative h-10 w-10'>
                        <Image fill referrerPolicy='no-referrer' className='rounded-full ring-2 ring-white' src={senderImg} alt={`${senderName} Profile picture`}/>
                    </div>
                </div>
                <div className='ml-3 flex-1'>
                    <p className='text-sm font-semibold text-slate-800'>{senderName}</p>
                    <p className='mt-1 text-sm text-slate-600 truncate'>{senderMessage}</p>
                </div>
            </div>
            
        </a>
        <div className='flex border-l border-white/50'>
                <button onClick={() => toast.dismiss(t.id)} className='w-full border-none rounded-none rounded-r-[24px] px-4 flex items-center justify-center text-sm font-medium text-sky-600 hover:text-sky-500 hover:bg-sky-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500'>
                    Close
                </button>
            </div>
        
        
    </div>
  )
}

export default UnseenChatToast
