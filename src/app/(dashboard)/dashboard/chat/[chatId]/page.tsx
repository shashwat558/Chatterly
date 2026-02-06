import ChatPageClient from '@/components/ChatPageClient';
import { fetchRedis } from '@/helpers/redis';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { messageArrayValidator } from '@/lib/validations/message';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';


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


const page = async ({params}: {params: Promise<{chatId: string}>}) => {

  const {chatId} = await params;
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
    <ChatPageClient
      chatId={chatId}
      initialMessages={initialMessages}
      sessionId={user.id}
      sessionImg={session.user.image}
      chatPartner={chatPartener}
      friends={friends}
    />
  )
}

export default page
