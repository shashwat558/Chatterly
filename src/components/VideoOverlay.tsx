"use client"

import { 
  PhoneXMarkIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  
  VideoCameraSlashIcon
} from "@heroicons/react/24/outline"
import { useState } from "react"

const VideoCallOverlay = ({
  remoteVideoRef,
  localVideoRef,
  onEndCall,
}: {
  remoteVideoRef: React.RefObject<HTMLVideoElement>
  localVideoRef: React.RefObject<HTMLVideoElement>
  onEndCall: () => void
}) => {
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      
      {/* Remote video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Local video (PiP) */}
      <div className="absolute top-4 right-4 w-40 h-56 rounded-xl overflow-hidden bg-black shadow-xl ring-1 ring-white/10">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      {/* Call controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full shadow-lg ring-1 ring-white/10">
        
        <button
          onClick={() => setMuted(!muted)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          {muted ? (
            <i className="fa fa-microphone-slash w-5 h-5 text-red-400" aria-hidden="true"></i>
          ) : (
            <MicrophoneIcon className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          onClick={() => setCameraOff(!cameraOff)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          {cameraOff ? (
            <VideoCameraSlashIcon className="w-5 h-5 text-red-400" />
          ) : (
            <VideoCameraIcon className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          onClick={onEndCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition"
        >
          <PhoneXMarkIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
}

export default VideoCallOverlay
