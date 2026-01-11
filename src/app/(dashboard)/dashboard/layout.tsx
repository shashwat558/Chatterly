import FreindRequetsSidebarOption from '@/components/FreindRequetsSidebarOption';
import { Icon, Icons } from '@/components/icons';
import SideBarChatList from '@/components/SideBarChatList';
import SignOutButton from '@/components/SignOutButton';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {FC, ReactNode} from 'react';


interface LayoutProps{
    children: ReactNode
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

const Layout: FC<LayoutProps> = async ({children}) => {
    const session = await getServerSession(authOptions)
    if(!session) notFound()
    
    const friends = await getFriendsByUserId(session.user.id);

        const unseenRequest = (await fetchRedis(
            'smembers',
            `user:${session.user.id}:incoming_friend_requests`
        ) as User[]).length


    return <SessionProvider session={session}><div className='w-full flex h-screen'>
        
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white -z-10" />

        <div className='relative flex h-full w-full max-w-[300px] shrink-0 grow flex-col gap-y-6 overflow-y-auto m-4 rounded-3xl p-6 overflow-hidden border-2 border-slate-200/60 shadow-xl'>
        
        {/* Sidebar Background Image */}
        <div className="absolute inset-0 -z-10">
            <Image 
                src="/sidebar.jpeg" 
                alt="" 
                fill 
                className="object-cover brightness-[0.85]" 
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-800/40 to-slate-900/50 backdrop-blur-[2px]" />
        </div>

        <Link  className='flex h-16 shrink-0 items-center gap-3 px-2 group' href={'/dashboard'}>
            <div className="p-1.5 bg-white/80 rounded-2xl group-hover:bg-white transition-all duration-300 shadow-md backdrop-blur-md border border-white/70">
               <Image src='/logo2.png' alt='Chatterly Logo' width={56} height={56} className='h-9 w-auto' />
            </div>
           <span className='font-bold text-xl text-white tracking-tight drop-shadow-md'>Chatterly</span>
        </Link>
        <div className='flex flex-1 flex-col gap-y-8'>
            <div className="flex flex-col gap-y-2 p-3 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm">
                <div className='text-[10px] font-bold leading-6 text-white/80 tracking-widest uppercase px-2'>
                    Conversations
                </div>
                <SideBarChatList friends={friends} sessionId={session.user.id}/>
            </div>
            
            <div className="flex flex-col gap-y-2 p-3 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm">
                 <div className='text-[10px] font-bold leading-6 text-white/80 tracking-widest uppercase px-2'>
                    Menu
                </div>
                <ul role='list' className='space-y-1'>
                    {sidebarOptions.map((option) => {
                        const Icon = Icons[option.Icon]
                        return (
                            <li key={option.id}>
                                <Link href={option.href} className='text-white/90 hover:text-white hover:bg-white/30 group flex gap-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-white/40'>

                                  <span className='text-white/70 group-hover:text-sky-300 flex justify-center items-center'>
                                    <Icon  className='h-5 w-5'/>
                                  </span>
                                  <span className='truncate'>{option.name}</span>
                                </Link>
                            </li>
                        )
                    })}
                     <li>
                    <FreindRequetsSidebarOption initialUnseenRequestCount={unseenRequest} sessionId={session.user.id}/>
                </li>
                </ul>
            </div>

             <div className='mt-auto flex items-center p-3 bg-white/70 rounded-2xl border border-white/60 shadow-lg backdrop-blur-md'>
                    <div className='flex flex-1 items-center gap-x-3 text-sm font-semibold leading-6 text-gray-800'>
                        <div className='relative h-10 w-10'>
                            <Image src={session.user.image || ""}
                            className='rounded-full ring-2 ring-white shadow-md'
                            fill
                            referrerPolicy='no-referrer'
                            alt='Your profile picture'
                            />
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white shadow-sm"></div>
                        </div>
                        <div className='flex flex-col'>
                            <span aria-hidden="true" className='text-slate-800 font-bold text-sm truncate max-w-[100px]'>{session.user.name}</span>
                            <span className='text-[11px] text-slate-600 truncate max-w-[100px] font-medium' aria-hidden='true'>
                                {session.user.email}
                            </span>
                        </div>
                    </div>
                    <SignOutButton  className='h-9 w-9 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl p-2 transition-all border border-transparent hover:border-red-200'/>

             </div>
        </div>
        
        </div>
        <main className="flex-1 max-w-full p-4 pl-0">
            <div className="h-full w-full bg-white/40 rounded-3xl border border-white/40 shadow-sm backdrop-blur-sm overflow-hidden relative">
                 {children}
            </div>
        
        </main>
        </div>
    </SessionProvider>
}

export default Layout;
