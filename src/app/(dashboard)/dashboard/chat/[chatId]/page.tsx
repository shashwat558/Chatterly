import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import { fetchRedis } from '@/helpers/redis';
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



  return (
    <div className='flex-1 justify-between flex flex-col max-h-[calc(100vh-6rem)]'>
      <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
        <div className='relative flex items-center space-x-4'>
          <div className='relative'>
            <div className='relative w-8 sm:w-12 sm:h-12'>
              <Image 
               fill
               referrerPolicy='no-referrer'
               src= {chatPartener.image}
               alt={`${chatPartener.name} profile picture`}
               className='rounded-full'
              />

            </div>
          </div>
          <div className='flex flex-col leading-tight'>
            <div className='text-xl flex items-center'>
              <span className='text-gray-700 mr-3 font-semibold'>{chatPartener.name}</span>
            </div>

            <span className='text-sm text-gray-600'>{chatPartener.email}</span>
          </div>
        </div>
      </div>

      <Messages chatId={chatId} initialMessages={initialMessages} sessionId={user.id} sessionImg={session.user.image} chatPartner={chatPartener} />
      <ChatInput chartPartener={chatPartener} chatId={chatId} />
    </div>
  )
}

export default page