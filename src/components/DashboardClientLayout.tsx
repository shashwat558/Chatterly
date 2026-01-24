"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import SideBarChatList from '@/components/SideBarChatList'
import SignOutButton from '@/components/SignOutButton'
import FreindRequetsSidebarOption from '@/components/FreindRequetsSidebarOption'
import { Icons, Icon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface DashboardClientLayoutProps {
    children: React.ReactNode
    friends: User[]
    sessionId: string
    sessionImage: string | null | undefined
    sessionName: string | null | undefined
    sessionEmail: string | null | undefined
    unseenRequestCount: number
}

interface SidebarOption {
    id: number
    name: string
    href: string
    Icon: Icon
}

const sidebarOptions: SidebarOption[] = [
    {
        id: 1,
        name: "Add friend",
        href: '/dashboard/add',
        Icon: 'UserPlus'
    },
    {
        id: 2,
        name: "Bookmarks",
        href: '/dashboard/bookmarks',
        Icon: 'Bookmark'
    }
]

const DashboardClientLayout = ({
    children,
    friends,
    sessionId,
    sessionImage,
    sessionName,
    sessionEmail,
    unseenRequestCount
}: DashboardClientLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen w-full bg-slate-50">
            {/* Mobile Sidebar (Drawer) */}
            <div className={cn("relative z-50 md:hidden", sidebarOpen ? "block" : "hidden")}>
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ease-linear"
                    onClick={() => setSidebarOpen(false)}
                />

                <div className="fixed inset-0 flex">
                    <div className="relative mr-16 flex w-full max-w-xs flex-1 animate-in slide-in-from-left duration-300">
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                <span className="sr-only">Close sidebar</span>
                                <X className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        
                        {/* Mobile Sidebar Content */}
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4 ring-1 ring-white/10 shadow-2xl">
                            <div className="flex h-16 shrink-0 items-center gap-3">
                                <div className="relative h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                                    <Image src='/logo2.png' alt='Chatterly' width={32} height={32} className='h-5 w-5' />
                                </div>
                                <span className='font-bold text-lg text-white'>Chatterly</span>
                            </div>
                            <nav className="flex flex-1 flex-col">
                                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <div className="text-xs font-semibold leading-6 text-indigo-200">Conversations</div>
                                        <SideBarChatList friends={friends} sessionId={sessionId} />
                                    </li>
                                    <li>
                                        <div className="text-xs font-semibold leading-6 text-indigo-200">Overview</div>
                                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                                            {sidebarOptions.map((option) => {
                                                const Icon = Icons[option.Icon]
                                                return (
                                                    <li key={option.name}>
                                                        <Link
                                                            href={option.href}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
                                                        >
                                                            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                            {option.name}
                                                        </Link>
                                                    </li>
                                                )
                                            })}
                                            <li>
                                                <FreindRequetsSidebarOption initialUnseenRequestCount={unseenRequestCount} sessionId={sessionId} />
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="mt-auto">
                                        <div className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-white">
                                            <div className='relative h-8 w-8 bg-slate-800 rounded-full'>
                                                <Image
                                                    fill
                                                    referrerPolicy='no-referrer'
                                                    className='rounded-full'
                                                    src={sessionImage || ''}
                                                    alt='Profile'
                                                />
                                            </div>
                                            <span className="sr-only">Your profile</span>
                                            <div className='flex flex-col'>
                                                <span aria-hidden='true'>{sessionName}</span>
                                                <span className='text-xs text-slate-400 font-normal truncate max-w-[140px]'>{sessionEmail}</span>
                                            </div>
                                        </div>
                                        <SignOutButton />
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0 md:z-50">
                <div className="flex grow flex-col gap-y-6 overflow-y-auto m-4 rounded-3xl p-6 overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl relative">
                     {/* Sidebar Background Image */}
                    <div className="absolute inset-0 -z-10">
                        <Image 
                            src="/sidebar.jpeg" 
                            alt="" 
                            fill 
                            className="object-cover opacity-10" 
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/60 to-white/80" />
                    </div>

                    <div className="flex h-16 shrink-0 items-center gap-3 px-2">
                         <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                             <Image src='/logo.png' alt='Chatterly Logo' width={56} height={56} className='h-6 w-auto brightness-0 invert' />
                         </div>
                         <span className='font-bold text-xl text-slate-800 tracking-tight'>Chatterly</span>
                    </div>

                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-8">
                            <li>
                                <div className='text-xs font-bold leading-6 text-slate-400 uppercase tracking-wider px-2 mb-2'>
                                    Conversations
                                </div>
                                <SideBarChatList friends={friends} sessionId={sessionId} />
                            </li>
                            <li>
                                <div className='text-xs font-bold leading-6 text-slate-400 uppercase tracking-wider px-2 mb-2'>
                                    Overview
                                </div>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {sidebarOptions.map((option) => {
                                        const Icon = Icons[option.Icon]
                                        return (
                                            <li key={option.name}>
                                                <Link
                                                    href={option.href}
                                                    className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200"
                                                >
                                                    <span className="p-1 rounded-lg bg-slate-100 group-hover:bg-white text-slate-500 group-hover:text-indigo-600 transition-colors border border-slate-200 group-hover:border-indigo-100">
                                                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                    </span>
                                                    <span className="truncate flex-1">{option.name}</span>
                                                </Link>
                                            </li>
                                        )
                                    })}
                                    <li>
                                        <FreindRequetsSidebarOption initialUnseenRequestCount={unseenRequestCount} sessionId={sessionId} />
                                    </li>
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <div className="flex items-center gap-x-4 py-4 px-2 bg-slate-50/50 rounded-2xl border border-slate-100 mb-2">
                                    <div className='relative h-10 w-10'>
                                        <Image
                                            fill
                                            referrerPolicy='no-referrer'
                                            className='rounded-full ring-2 ring-white shadow-sm object-cover'
                                            src={sessionImage || ''}
                                            alt='Profile'
                                        />
                                    </div>
                                    <div className='flex flex-col min-w-0'>
                                        <span className='sr-only'>Your profile</span>
                                        <span className='text-sm font-semibold text-slate-900 truncate' aria-hidden='true'>{sessionName}</span>
                                        <span className='text-xs text-slate-500 truncate'>{sessionEmail}</span>
                                    </div>
                                </div>
                                <SignOutButton />
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col md:pl-80 h-full overflow-hidden">
                {/* Mobile Header */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm md:hidden">
                    <button 
                        type="button" 
                        className="-m-2.5 p-2.5 text-slate-700 lg:hidden" 
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg">
                            <Image src='/logo.png' alt='Chatterly' width={24} height={24} className='h-4 w-auto brightness-0 invert' />
                        </div>
                        <span className='font-bold text-lg text-slate-800'>Chatterly</span>
                    </div>
                     <div className="w-6" /> 
                </div>

                <main className="flex-1 overflow-hidden h-full relative">
                     <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardClientLayout