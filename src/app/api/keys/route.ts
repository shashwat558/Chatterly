import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    
    const { publicKey, userId } = body;

    console.log(`Storing public key for user ${userId}: ${publicKey}`);

    const alreadyExistsResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:${userId}:identity_key`, {
         headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            cache: 'no-store',
    });

    if (!alreadyExistsResponse.ok) {
        await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/user:${userId}:identity_key`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: publicKey
            })
        });
    }

    return new Response("Public key stored successfully", { status: 200 });

    
}