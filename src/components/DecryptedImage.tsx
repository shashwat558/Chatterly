"use client"
import { decryptImage } from '@/lib/encryption/messageEncryption';
import { ImageMessagePayload } from '@/lib/validations/message'
import React, { useEffect, useState } from 'react'

interface DecryptedImageProps {
    payload: ImageMessagePayload
    chatId: string
}

const DecryptedImage = ({ payload, chatId }: DecryptedImageProps) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isActive = true;

        const uint8ToBase64 = (u8: Uint8Array) => {
            let binary = '';
            const chunkSize = 0x8000;
            for (let i = 0; i < u8.length; i += chunkSize) {
                binary += String.fromCharCode(...u8.subarray(i, i + chunkSize));
            }
            return btoa(binary);
        };

        const decrypt = async () => {
            try {
                setLoading(true);
                setError(null);

                let downloadUrl = payload.url;
                
                if (payload.objectKey) {
                    const response = await fetch('/api/downlaod-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ objectKey: payload.objectKey, chatId })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to get download URL');
                    }

                    const data = await response.json();
                    downloadUrl = data.downloadUrl;
                }

                const imageResponse = await fetch(downloadUrl);
                if (!imageResponse.ok) throw new Error('Failed to fetch encrypted image');
                
                const buffer = await imageResponse.arrayBuffer();
                const base64Encrypted = uint8ToBase64(new Uint8Array(buffer));

                const decryptedBytes = await decryptImage(base64Encrypted, payload.fileKey, payload.nonce);
                const uint8 = new Uint8Array(decryptedBytes);
                const blob = new Blob([uint8], { type: 'image/*' });
                objectUrl = URL.createObjectURL(blob);

                if (isActive) {
                    setImageSrc(objectUrl);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Failed to decrypt image:', err);
                if (isActive) {
                    setError(err instanceof Error ? err.message : 'Failed to load image');
                    setLoading(false);
                }
            }
        };

        decrypt();

        return () => {
            isActive = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [payload, chatId]);
    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="text-xs text-slate-400">Decrypting image...</div>
            </div>
        );
    }

    if (error || !imageSrc) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="text-xs text-rose-500">{error || 'Failed to load image'}</div>
            </div>
        );
    }

    return (
        <img 
            src={imageSrc} 
            alt="Shared image" 
            className="max-w-full rounded-lg shadow-sm"
        />
    );
}

export default DecryptedImage