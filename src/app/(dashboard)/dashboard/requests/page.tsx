import FriendRequest from '@/components/FriendRequest';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Image from 'next/image';
import React, { FC } from 'react'

const page: FC = async () => {
    const session = await getServerSession(authOptions);
    if(!session)return (<div>You are not authorized</div>)

    const incomingSenderIds = await fetchRedis(
        'smembers', 
        `user:${session.user.id}:incoming_friend_requests`
    ) as string[]

    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = await fetchRedis('get', `user:${senderId}`) as string
            const senderParsed = JSON.parse(sender) as User
            
            return {
                senderId,
                senderEmail : senderParsed.email
            }
        })
    )

  return (
    <main className='relative min-h-full'>
      
      <div className="absolute inset-0 -z-10 overflow-hidden" style={{ 
        maskImage: '', 
        WebkitMaskImage: '' 
      }}>
        <Image 
          src="/friendRequest.jpeg" 
          alt="" 
          fill 
          className="object-cover" 
          priority
        />
      </div>

   
      <div className='relative z-10 pt-8 pb-12 px-8 max-w-4xl mx-auto'>
        
        <div className='mb-10'>
          <h1 className='font-bold text-4xl text-slate-200 mb-2'>Friend Requests</h1>
          <p className='text-slate-300 text-lg'>Connect with people who want to chat with you</p>
        </div>

        {/* Requests Container */}
        <div className='glass-panel rounded-3xl p-6 shadow-xl'>
          <div className='flex flex-col gap-3 w-full'>
            <FriendRequest incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id} />
          </div>
        </div>
      </div>

    </main>
  )
}

export default page
