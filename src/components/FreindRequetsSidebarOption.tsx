'use client'

import { User } from 'lucide-react'
import Link from 'next/link'
import React, { FC, useState } from 'react'

interface FreindRequetsSidebarOptionProps{
    initialUnseenRequestCount : number
    sessionId : string
}

const FreindRequetsSidebarOption: FC<FreindRequetsSidebarOptionProps> = ({
    initialUnseenRequestCount,
    sessionId
}) => {

    const [unseenRequestCount, setrUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )
    console.log(unseenRequestCount)



  return (
    <Link href='/dashboard/requests' className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold'>
        <div className='text-gray-400 border-gray-200 group-hover:border-indigo-500 group-hover:text-indigo-600 flex h06 h-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] bg-white'>
            <User  className='h-5 w-5'/>
        </div>
        <p className='truncate'>Friend requests</p>

        {unseenRequestCount > 0 ? (
            <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>
                {unseenRequestCount}
            </div>
        ): null}
    </Link>
  )
}

export default FreindRequetsSidebarOption