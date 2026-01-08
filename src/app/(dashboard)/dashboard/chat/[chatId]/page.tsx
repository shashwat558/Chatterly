import ChatContainer from '@/components/ChatContainer';
import { fetchRedis } from '@/helpers/redis';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { messageArrayValidator } from '@/lib/validations/message';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import React, { FC } from 'react'

interface PageProps {
  params: {
    chatId : string
  }
}

const getChatMessages = async (chatId: string)=>{
  try {
    const results : string[] = await fetchRedis(
      'zrange',
      `chat:${chatId}:messages`,
      0,
      -1
    )   

    const dbMessages = results.map((message) => JSON.parse(message) as Message)

    const reversedDBMesages = dbMessages.reverse()

    const messages = messageArrayValidator.parse(reversedDBMesages)


    return messages


  } catch (error) {
    console.log(error)
    notFound()
    
  }
}


const page: FC<PageProps> = async ({params}: PageProps) => {

  const {chatId} = params;
  const session = await getServerSession(authOptions);
  if(!session){
    return notFound()
  }

  const { user } = session;

  const [userId1, userId2] = chatId.split('--');

  if(user.id !== userId1 && user.id !== userId2){
     notFound()
  }

  const chatPartenerId = user.id === userId1 ? userId2: userId1
  const chatPartener = (await db.get(`user:${chatPartenerId}`)) as User
  const initialMessages = await getChatMessages(chatId)
  const friends = await getFriendsByUserId(user.id)



  return (
    <div className='flex-1 justify-between flex flex-col h-full max-h-screen relative'>
      
     <div className='absolute inset-0 z-0 overflow-hidden pointer-events-none' style={{ 
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', 
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)' 
        }}>
          <Image 
            src="/bg.avif" 
            alt="Chat Background" 
            fill
            className='object-cover opacity-70'
            priority
          />
      </div>

      <div className='absolute top-4 left-4 right-4 z-10'>
          <div className='flex sm:items-center justify-between py-3 px-6 glass-panel rounded-2xl'>
            <div className='relative flex items-center gap-4'>
                <div className='relative w-10 h-10'>
                  <Image 
                  fill
                  referrerPolicy='no-referrer'
                  src= {chatPartener.image}
                  alt={`${chatPartener.name} profile picture`}
                  className='rounded-full ring-2 ring-white shadow-sm'
                  />
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white shadow-sm"></div>

                </div>
              <div className='flex flex-col leading-tight'>
                <div className='text-lg flex items-center'>
                  <span className='text-slate-800 font-bold mr-3'>{chatPartener.name}</span>
                </div>
                <span className='text-xs text-slate-400 max-w-xs truncate font-medium'>{chatPartener.email}</span>
              </div>
            </div>
          </div>
      </div>

      <ChatContainer 
        chatId={chatId} 
        initialMessages={initialMessages} 
        sessionId={user.id} 
        sessionImg={session.user.image} 
        chatPartner={chatPartener}
        friends={friends}
      />
    </div>
  )
}

export default page
