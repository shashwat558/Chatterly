import { authOptions } from '@/lib/auth'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

const page = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const friends = await getFriendsByUserId(session.user.id)

  const friendRequests = (
    (await fetchRedis(
      'smembers',
      `user:${session.user.id}:incoming_friend_requests`
    )) as string[]
  ).length

  const chatIds = friends.map((friend) => {
    const sortedIds = [session.user.id, friend.id].sort()
    return `chat:${sortedIds.join('--')}:messages`
  })

  let totalMessages = 0
  for (const chatId of chatIds) {
    totalMessages += (await fetchRedis('zcard', chatId)) as number
  }

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        name: session.user.name!,
      }}
      friends={friends}
      friendRequests={friendRequests}
      totalMessages={totalMessages}
    />
  )
}

export default page
