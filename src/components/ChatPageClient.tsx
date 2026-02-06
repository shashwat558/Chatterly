'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import ChatContainer from '@/components/ChatContainer'
import StartVideoCall from '@/components/StartVideoCall'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { Message } from '@/lib/validations/message'

interface ChatPageClientProps {
  chatId: string
  initialMessages: Message[]
  sessionId: string
  sessionImg: string | null | undefined
  chatPartner: User
  friends: User[]
}

const ChatPageClient = ({
  chatId,
  initialMessages,
  sessionId,
  sessionImg,
  chatPartner,
  friends,
}: ChatPageClientProps) => {
  const [partnerPresence, setPartnerPresence] = useState<'online' | 'offline' | 'unknown'>('unknown')

  useEffect(() => {
    setPartnerPresence('unknown')

    const presenceChannelName = toPusherKey(`presence-chat:${chatId}`)
    const presenceChannel = pusherClient.subscribe(presenceChannelName) as any

    const handleSubscriptionSucceeded = (members: any) => {
      if (members?.members && members.members[chatPartner.id]) {
        setPartnerPresence('online')
        return
      }
      if (typeof members?.get === 'function' && members.get(chatPartner.id)) {
        setPartnerPresence('online')
        return
      }
      setPartnerPresence('offline')
    }

    const handleMemberAdded = (member: any) => {
      if (member?.id === chatPartner.id) {
        setPartnerPresence('online')
      }
    }

    const handleMemberRemoved = (member: any) => {
      if (member?.id === chatPartner.id) {
        setPartnerPresence('offline')
      }
    }

    presenceChannel.bind('pusher:subscription_succeeded', handleSubscriptionSucceeded)
    presenceChannel.bind('pusher:member_added', handleMemberAdded)
    presenceChannel.bind('pusher:member_removed', handleMemberRemoved)

    return () => {
      presenceChannel.unbind('pusher:subscription_succeeded', handleSubscriptionSucceeded)
      presenceChannel.unbind('pusher:member_added', handleMemberAdded)
      presenceChannel.unbind('pusher:member_removed', handleMemberRemoved)
      pusherClient.unsubscribe(presenceChannelName)
    }
  }, [chatId, chatPartner.id])

  return (
    <div className='flex-1 justify-between flex flex-col h-full max-h-screen relative'>
      <div
        className='absolute inset-0 z-0 overflow-hidden pointer-events-none'
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <Image src='/bg.avif' alt='Chat Background' fill className='object-cover opacity-70' priority />
      </div>

      <div className='absolute top-4 left-4 right-4 z-10'>
        <div className='flex sm:items-center justify-between py-3 px-6 glass-panel rounded-2xl'>
          <div className='relative flex items-center gap-4'>
            <div className='relative w-10 h-10'>
              <Image
                fill
                referrerPolicy='no-referrer'
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                className='rounded-full ring-2 ring-white shadow-sm'
              />
              <div className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white shadow-sm'></div>
            </div>
            <div className='flex flex-col leading-tight'>
              <div className='text-lg flex items-center'>
                <span className='text-slate-800 font-bold mr-3'>{chatPartner.name}</span>
              </div>
              <span className='text-xs text-slate-400 max-w-xs truncate font-medium'>{chatPartner.email}</span>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <StartVideoCall partnerPresence={partnerPresence} partner={chatPartner} />
          </div>
        </div>
      </div>

      <ChatContainer
        chatId={chatId}
        initialMessages={initialMessages}
        sessionId={sessionId}
        sessionImg={sessionImg}
        chatPartner={chatPartner}
        friends={friends}
        partnerPresence={partnerPresence}
      />
    </div>
  )
}

export default ChatPageClient
