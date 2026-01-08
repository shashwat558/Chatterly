import { authOptions } from '@/lib/auth'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Icons } from '@/components/icons'

const page = async({}) =>  {
  const session = await getServerSession(authOptions)
  if(!session){
    return redirect('/')
  }

  
  const friends = await getFriendsByUserId(session.user.id)
  const friendRequests = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`
  ) as string[]).length


  const chatIds = friends.map(friend => {
    const sortedIds = [session.user.id, friend.id].sort()
    return `chat:${sortedIds.join('--')}:messages`
  })

  let totalMessages = 0
  for (const chatId of chatIds) {
    const count = await fetchRedis('zcard', chatId) as number
    totalMessages += count
  }

  return (
    <div className='h-full w-full relative overflow-hidden'>

      <div className="absolute inset-0 -z-10">
        <Image 
          src="/dashboard.jpeg" 
          alt="" 
          fill 
          className="object-cover" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-sky-900/60 backdrop-blur-[1px]" />
      </div>

      <div className="h-full flex flex-col items-center justify-center p-8">

        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white/90 text-sm font-medium mb-6">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
            Online
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Welcome back, <span className="text-sky-300">{session.user.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-white/70 text-lg max-w-md mx-auto">
            Ready to connect? Your conversations are waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full max-w-3xl">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-400/30 rounded-xl group-hover:bg-sky-400/40 transition-colors">
                <Icons.Users className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{friends.length}</p>
                <p className="text-white/60 text-sm font-medium">Friends</p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-400/30 rounded-xl group-hover:bg-amber-400/40 transition-colors">
                <Icons.UserPlus className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{friendRequests}</p>
                <p className="text-white/60 text-sm font-medium">Pending Requests</p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-400/30 rounded-xl group-hover:bg-emerald-400/40 transition-colors">
                <Icons.MessageSquare className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{totalMessages}</p>
                <p className="text-white/60 text-sm font-medium">Total Messages</p>
              </div>
            </div>
          </div>
        </div>


        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/dashboard/add"
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/30 transition-all duration-300 hover:scale-105"
          >
            <Icons.UserPlus className="h-5 w-5" />
            Add Friend
          </Link>
          
          {friendRequests > 0 && (
            <Link 
              href="/dashboard/requests"
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
            >
              <Icons.User className="h-5 w-5" />
              View Requests
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">{friendRequests}</span>
            </Link>
          )}

          <Link 
            href="/dashboard/bookmarks"
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl backdrop-blur-md border border-white/30 transition-all duration-300 hover:scale-105"
          >
            <Icons.Bookmark className="h-5 w-5" />
            Bookmarks
          </Link>
        </div>

        {/* Recent Friends */}
        {friends.length > 0 && (
          <div className="mt-10 w-full max-w-2xl">
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4 text-center">
              Start a conversation
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {friends.slice(0, 5).map((friend) => {
                const chatId = [session.user.id, friend.id].sort().join('--')
                return (
                  <Link
                    key={friend.id}
                    href={`/dashboard/chat/${chatId}`}
                    className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <Image
                        src={friend.image}
                        alt={friend.name}
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-white/30 group-hover:ring-sky-400/50 transition-all"
                      />
                    </div>
                    <span className="text-white font-medium text-sm">{friend.name.split(' ')[0]}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {friends.length === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
              <Icons.Users className="h-8 w-8 text-white/60" />
            </div>
            <p className="text-white/60 text-sm">
              No friends yet. Add someone to start chatting!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default page