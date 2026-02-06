'use client'

import { FC, useEffect, useRef } from 'react'
import { usePeer } from '@/providers/Peer'
import { PhoneXMarkIcon, MicrophoneIcon, VideoCameraIcon, VideoCameraSlashIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface VideoCallOverlayProps {
    partnerName: string
    onEnd: () => void
}

const VideoCallOverlay: FC<VideoCallOverlayProps> = ({ partnerName, onEnd }) => {
    const peerContext = usePeer()
    const localStream = peerContext?.localStream
    const remoteStream = peerContext?.remoteStream
    const callState = peerContext?.callState ?? 'idle'
    const endCall = peerContext?.endCall

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled
            })
            setIsMuted(prev => !prev)
        }
    }

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled
            })
            setIsVideoOff(prev => !prev)
        }
    }

    const handleEndCall = () => {
        endCall?.()
        onEnd()
    }

    return (
        <div className='fixed inset-0 z-50 bg-slate-900 flex flex-col'>
            {/* Remote video (full screen) */}
            <div className='flex-1 relative'>
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className='w-full h-full object-cover'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                        <div className='text-center'>
                            <div className='w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4'>
                                <span className='text-4xl text-white font-bold'>
                                    {partnerName?.charAt(0)?.toUpperCase() ?? '?'}
                                </span>
                            </div>
                            <p className='text-white text-xl font-semibold'>{partnerName}</p>
                            <p className='text-slate-400 text-sm mt-1'>
                                {callState === 'calling' && 'Calling…'}
                                {callState === 'incoming' && 'Connecting…'}
                                {callState === 'connected' && 'Connected'}
                                {callState === 'idle' && 'Ended'}
                            </p>
                            {callState === 'calling' && (
                                <div className='flex justify-center gap-1 mt-4'>
                                    <span className='w-2 h-2 bg-sky-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                                    <span className='w-2 h-2 bg-sky-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
                                    <span className='w-2 h-2 bg-sky-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Local video (picture-in-picture) */}
                {localStream && (
                    <div className='absolute top-4 right-4 w-36 h-48 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20'>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className='w-full h-full object-cover mirror'
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className='flex items-center justify-center gap-6 py-8 bg-slate-900/80 backdrop-blur-sm'>
                <button
                    type='button'
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    <MicrophoneIcon className='w-6 h-6' />
                </button>

                <button
                    type='button'
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                    aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? (
                        <VideoCameraSlashIcon className='w-6 h-6' />
                    ) : (
                        <VideoCameraIcon className='w-6 h-6' />
                    )}
                </button>

                <button
                    type='button'
                    onClick={handleEndCall}
                    className='w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg'
                    aria-label='End call'
                >
                    <PhoneXMarkIcon className='w-7 h-7' />
                </button>
            </div>
        </div>
    )
}

export default VideoCallOverlay
