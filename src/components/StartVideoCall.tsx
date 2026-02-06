"use client"
import { VideoCameraIcon } from '@heroicons/react/24/outline'

import toast from 'react-hot-toast'
import { usePeer} from '@/providers/Peer'

const StartVideoCall = ({partnerPresence, partnerId}: {partnerPresence: 'online' | 'offline' | 'unknown', partnerId: string}) => {
  const { peer, createOffer } = usePeer();
   const handleStartCall = async() => {
     if(partnerPresence !== 'online'){
       toast('Your chat partner is not online. They need to be online to start a video call.')
       return
     }
     try {
      const offer = await createOffer();
      await fetch("/api/video-call/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partnerId, offer }),
      })
     } catch (error) {
        console.error("Error starting video call:", error);
        toast.error('Failed to start video call. Please try again.')
        return
     }
     
     toast('Video call started!')
   }
    
    
  return (
    <button
                type='button'
                className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow-md hover:bg-sky-600 active:scale-[0.99] transition'
                 onClick={handleStartCall}
                aria-label='Start video call'
              >
                <VideoCameraIcon className='w-4 h-4' />
                Start call
              </button>
  )
}

export default StartVideoCall;