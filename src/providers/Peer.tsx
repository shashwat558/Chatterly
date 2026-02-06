"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"


type PeerContextType = {
    peer: RTCPeerConnection | null;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
};

const PeerContext = createContext<PeerContextType | null>(null);

export const usePeer = () => useContext(PeerContext);
export const PeerProvider = (props:any) => {
     const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

    const createOffer = useCallback(async () => {
        if (!peer) {
            throw new Error("Peer connection is not initialized");
        }
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }, [peer]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

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
        });

        setPeer(connection);

        return () => {
            connection.close();
            setPeer(null);
        }

    },[]);
    
    return (
      <PeerContext.Provider value={{peer, createOffer}}>{props.children}</PeerContext.Provider>
    )
} 