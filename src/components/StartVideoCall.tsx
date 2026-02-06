"use client"
import { VideoCameraIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { usePeer } from '@/providers/Peer'

const StartVideoCall = ({
  partnerPresence,
  partner,
}: {
  partnerPresence: 'online' | 'offline' | 'unknown'
  partner: User
}) => {
  const peerContext = usePeer()

  const handleStartCall = async () => {
    if (partnerPresence !== 'online') {
      toast('Your chat partner is not online. They need to be online to start a video call.')
      return
    }

    if (!peerContext) {
      toast.error('Peer connection not ready')
      return
    }

    const { createOffer, startLocalStream, sendStream, setCallState, setPartnerId, callState } = peerContext

    if (callState !== 'idle') {
      toast('A call is already in progress.')
      return
    }

    try {
      // Set call state first so the overlay appears immediately
      setPartnerId(partner.id)
      setCallState('calling')

      // Start local camera/mic and send the stream to the peer
      const stream = await startLocalStream()
      sendStream(stream)

      // Create and send the offer via the signalling server
      const offer = await createOffer()
      await fetch('/api/video-call/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: partner.id, offer }),
      })
    } catch (error) {
      console.error('Error starting video call:', error)
      toast.error('Failed to start video call. Please try again.')
      // Roll back state on failure
      peerContext.endCall()
    }
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

export default StartVideoCall