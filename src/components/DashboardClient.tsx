'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ensureIdentityKey } from '@/lib/encryption/keys'

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
  const { data: session, status } = useSession()
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      ensureIdentityKey(session.user.id)
    }
  }, [status, session])

  return (
    <div className="h-full w-full overflow-y-auto relative">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/dashboard.jpeg"
          alt=""
          fill
          className="object-cover opacity-[0.03]"
          priority
        />
      </div>
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Hi, {user.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">
            {friends.length === 0 
              ? "Get started by adding some friends" 
              : `You have ${friends.length} friend${friends.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icons.Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{friends.length}</p>
                <p className="text-xs text-gray-500">Friends</p>
              </div>
            </div>
          </div>

          <Link href="/dashboard/requests" className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <Icons.UserPlus className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{friendRequests}</p>
                <p className="text-xs text-gray-500">Requests</p>
              </div>
            </div>
          </Link>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Icons.MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{totalMessages}</p>
                <p className="text-xs text-gray-500">Messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Friends List */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Recent chats</h2>
              <Link href="/dashboard/add" className="text-sm text-blue-600 hover:text-blue-700">
                + Add friend
              </Link>
            </div>
            
            {friends.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {friends.slice(0, 6).map((friend) => {
                  const chatId = [user.id, friend.id].sort().join('--')
                  return (
                    <Link
                      key={friend.id}
                      href={`/dashboard/chat/${chatId}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Image
                        src={friend.image}
                        alt={friend.name}
                        width={36}
                        height={36}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {friend.name}
                        </p>
                        <p className="text-xs text-gray-500">Click to open chat</p>
                      </div>
                      <Icons.ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <Icons.Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No friends yet</p>
                <Link 
                  href="/dashboard/add" 
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                >
                  Add your first friend
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Quick actions</h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard/add"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <Icons.UserPlus className="h-4 w-4 text-gray-400" />
                  Add a friend
                </Link>
                <Link
                  href="/dashboard/requests"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <Icons.User className="h-4 w-4 text-gray-400" />
                  View requests
                  {friendRequests > 0 && (
                    <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                      {friendRequests}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/bookmarks"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <Icons.Bookmark className="h-4 w-4 text-gray-400" />
                  Bookmarks
                </Link>
              </div>
            </div>

            {friendRequests > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Icons.UserPlus className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      {friendRequests} pending request{friendRequests === 1 ? '' : 's'}
                    </p>
                    <p className="text-xs text-orange-700 mt-0.5">
                      Someone wants to connect with you
                    </p>
                    <Link
                      href="/dashboard/requests"
                      className="text-xs font-medium text-orange-700 hover:text-orange-800 mt-2 inline-block"
                    >
                      View requests →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardClient
