"use client"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

export type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'

type PeerContextType = {
    peer: RTCPeerConnection | null
    createOffer: () => Promise<RTCSessionDescriptionInit>
    createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
    applyRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>
    sendStream: (stream: MediaStream) => void
    remoteStream: MediaStream | null
    localStream: MediaStream | null
    callState: CallState
    setCallState: (state: CallState) => void
    partnerId: string | null
    setPartnerId: (id: string | null) => void
    startLocalStream: () => Promise<MediaStream>
    stopLocalStream: () => void
    endCall: () => void
    addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>
    handleNegotiationOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
    applyNegotiationAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>
}

const PeerContext = createContext<PeerContextType | null>(null)

export const usePeer = () => useContext(PeerContext)

export const PeerProvider = (props: any) => {
    const [peer, setPeer] = useState<RTCPeerConnection | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [callState, setCallState] = useState<CallState>('idle')
    const [partnerId, setPartnerId] = useState<string | null>(null)
    const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([])

    const createOffer = useCallback(async () => {
        if (!peer) throw new Error("Peer connection is not initialized")
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }, [peer])

    const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
        if (!peer) throw new Error("Peer connection is not initialized")
        await peer.setRemoteDescription(offer)
        // Flush queued ICE candidates
        for (const candidate of iceCandidateQueue.current) {
            await peer.addIceCandidate(candidate)
        }
        iceCandidateQueue.current = []
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return answer
    }, [peer])

    const applyRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        if (!peer) throw new Error("Peer connection is not initialized")
        await peer.setRemoteDescription(answer)
        // Flush queued ICE candidates
        for (const candidate of iceCandidateQueue.current) {
            await peer.addIceCandidate(candidate)
        }
        iceCandidateQueue.current = []
    }, [peer])

    const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        if (!peer) return
        if (peer.remoteDescription) {
            await peer.addIceCandidate(candidate)
        } else {
            iceCandidateQueue.current.push(candidate)
        }
    }, [peer])

    const handleNegotiationOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
        if (!peer) throw new Error("Peer connection is not initialized")
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return answer
    }, [peer])

    const applyNegotiationAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        if (!peer) throw new Error("Peer connection is not initialized")
        await peer.setRemoteDescription(answer)
    }, [peer])

    const sendStream = useCallback((stream: MediaStream) => {
        if (!peer) return
        const senders = peer.getSenders()
        for (const track of stream.getTracks()) {
            const existingSender = senders.find(s => s.track?.kind === track.kind)
            if (existingSender) {
                existingSender.replaceTrack(track)
            } else {
                peer.addTrack(track, stream)
            }
        }
    }, [peer])

    const startLocalStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setLocalStream(stream)
        return stream
    }, [])

    const stopLocalStream = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
            setLocalStream(null)
        }
    }, [localStream])

    const endCall = useCallback(() => {
        stopLocalStream()
        setRemoteStream(null)
        setCallState('idle')
        setPartnerId(null)
        // Remove all senders
        if (peer) {
            peer.getSenders().forEach(sender => {
                try { peer.removeTrack(sender) } catch {}
            })
        }
    }, [peer, stopLocalStream])

    // Handle remote tracks
    useEffect(() => {
        if (!peer) return
        const onTrack = (event: RTCTrackEvent) => {
            const [stream] = event.streams
            if (stream) {
                setRemoteStream(stream)
            }
        }
        peer.addEventListener('track', onTrack)
        return () => { peer.removeEventListener('track', onTrack) }
    }, [peer])

    // Handle negotiationneeded
    useEffect(() => {
        if (!peer || !partnerId) return
        const onNegotiationNeeded = async () => {
            if (callState !== 'connected' && callState !== 'calling') return
            try {
                const offer = await peer.createOffer()
                await peer.setLocalDescription(offer)
                await fetch('/api/video-call/negotiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ offer, partnerId }),
                })
            } catch (error) {
                console.error('Negotiation failed:', error)
            }
        }
        peer.addEventListener('negotiationneeded', onNegotiationNeeded)
        return () => { peer.removeEventListener('negotiationneeded', onNegotiationNeeded) }
    }, [peer, partnerId, callState])

    // Handle ICE candidates
    useEffect(() => {
        if (!peer || !partnerId) return
        const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                fetch('/api/video-call/ice-candidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ candidate: event.candidate.toJSON(), partnerId }),
                }).catch(err => console.error('Failed to send ICE candidate:', err))
            }
        }
        peer.addEventListener('icecandidate', onIceCandidate)
        return () => { peer.removeEventListener('icecandidate', onIceCandidate) }
    }, [peer, partnerId])

    // Handle connection state
    useEffect(() => {
        if (!peer) return
        const onConnectionStateChange = () => {
            if (peer.connectionState === 'connected') {
                setCallState('connected')
            } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed' || peer.connectionState === 'closed') {
                endCall()
            }
        }
        peer.addEventListener('connectionstatechange', onConnectionStateChange)
        return () => { peer.removeEventListener('connectionstatechange', onConnectionStateChange) }
    }, [peer, endCall])

    // Create RTCPeerConnection
    useEffect(() => {
        if (typeof window === 'undefined') return

        const connection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                    ],
                },
            ],
        })

        setPeer(connection)

        return () => {
            connection.close()
            setPeer(null)
        }
    }, [])

    return (
        <PeerContext.Provider value={{
            peer, createOffer, createAnswer, applyRemoteAnswer,
            sendStream, remoteStream, localStream,
            callState, setCallState, partnerId, setPartnerId,
            startLocalStream, stopLocalStream, endCall,
            addIceCandidate, handleNegotiationOffer, applyNegotiationAnswer,
        }}>
            {props.children}
        </PeerContext.Provider>
    )
}