'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Icons } from '@/components/icons'

interface Friend {
  id: string
  name: string
  image: string
}

interface DashboardClientProps {
  user: {
    id: string
    name: string | null
  }
  friends: Friend[]
  friendRequests: number
  totalMessages: number
}

const DashboardClient = ({
  user,
  friends,
  friendRequests,
  totalMessages,
}: DashboardClientProps) => {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Background */}
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
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white/90 text-sm font-medium mb-6">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Welcome back,{' '}
            <span className="text-sky-300">
              {user.name?.split(' ')[0]}
            </span>{' '}
            👋
          </h1>

          <p className="text-white/70 text-lg max-w-md mx-auto">
            Ready to connect? Your conversations are waiting.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full max-w-3xl">
          <StatCard
            icon={<Icons.Users className="h-6 w-6 text-sky-300" />}
            value={friends.length}
            label="Friends"
            color="sky"
          />

          <StatCard
            icon={<Icons.UserPlus className="h-6 w-6 text-amber-300" />}
            value={friendRequests}
            label="Pending Requests"
            color="amber"
          />

          <StatCard
            icon={<Icons.MessageSquare className="h-6 w-6 text-emerald-300" />}
            value={totalMessages}
            label="Total Messages"
            color="emerald"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/dashboard/add"
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:scale-105"
          >
            <Icons.UserPlus className="h-5 w-5" />
            Add Friend
          </Link>

          {friendRequests > 0 && (
            <Link
              href="/dashboard/requests"
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
            >
              <Icons.User className="h-5 w-5" />
              View Requests
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                {friendRequests}
              </span>
            </Link>
          )}

          <Link
            href="/dashboard/bookmarks"
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl backdrop-blur-md border border-white/30 transition-all hover:scale-105"
          >
            <Icons.Bookmark className="h-5 w-5" />
            Bookmarks
          </Link>
        </div>

        {/* Recent Friends */}
        {friends.length > 0 ? (
          <div className="mt-10 w-full max-w-2xl">
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4 text-center">
              Start a conversation
            </h3>

            <div className="flex flex-wrap gap-3 justify-center">
              {friends.slice(0, 5).map((friend) => {
                const chatId = [user.id, friend.id].sort().join('--')

                return (
                  <Link
                    key={friend.id}
                    href={`/dashboard/chat/${chatId}`}
                    className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all group"
                  >
                    <Image
                      src={friend.image}
                      alt={friend.name}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-white/30 group-hover:ring-sky-400/50"
                    />
                    <span className="text-white font-medium text-sm">
                      {friend.name.split(' ')[0]}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
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

export default DashboardClient

/* ---------------- helpers ---------------- */

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: 'sky' | 'amber' | 'emerald'
}) => {
  return (
    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/10">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-white/60 text-sm font-medium">{label}</p>
        </div>
      </div>
    </div>
  )
}
