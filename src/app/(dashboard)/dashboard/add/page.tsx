import AddFriendButton from '@/components/AddFriendButton'
import Image from 'next/image'
import React, { FC } from 'react'

const page : FC = () => {
  return ( 
  <main className='relative min-h-full'>
    <div className="absolute inset-0 -z-10 overflow-hidden" style={{ 
      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)', 
      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)' 
    }}>
      <Image 
        src="/addFriend.jpeg" 
        alt="" 
        fill 
        className="object-cover" 
        priority
      />
    </div>
    <div className='relative z-10 pt-20 pb-12 px-8 max-w-2xl mx-auto'>
      <div className='glass-panel p-10 rounded-[40px] text-center shadow-xl'>
           <h1 className='font-bold text-5xl mb-6 bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent'>Add a Friend</h1>
           <p className="text-slate-500 mb-10 text-lg">Expand your circle securely.</p>
          <AddFriendButton />
      </div>
    </div>
   
  </main>
    
  )
}

export default page
