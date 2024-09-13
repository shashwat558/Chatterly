import FriendRequest from '@/components/FriendRequest';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
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
            console.log(sender + "sdsfjlfj")
            const senderParsed = JSON.parse(sender) as User
            
            return {
                senderId,
                senderEmail : senderParsed.email
            }
        })
    )

  return (
    <main className='pt-8 pl-8'>
    <h1 className='font-bold text-5xl mb-8'>Friend Requests</h1>
    <div className='flex flex-col gap-4'>
        <FriendRequest incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id} />
    </div>
  </main>
  )
}

export default page