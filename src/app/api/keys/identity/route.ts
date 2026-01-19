import { NextRequest } from "next/server";
import { fetchRedis } from "@/helpers/redis";

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
    const {result} = await alreadyExistsResponse.text().then(text => JSON.parse(text));
    console.log('Existing key fetch result:', result);

    if (result === null) {
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
        return new Response("Public key stored successfully", { status: 200 });
    } else {
        return new Response("Public key already exists", { status: 409 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
        return new Response(JSON.stringify({ error: "userId is required" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const identityKeyData = await fetchRedis("get", `user:${userId}:identity_key`);
        
        // The key is stored as JSON string with { value: "..." } structure
        let identityKey = identityKeyData;
        if (identityKeyData && typeof identityKeyData === 'string') {
            try {
                const parsed = JSON.parse(identityKeyData);
                identityKey = parsed.value || identityKeyData;
            } catch {
                // If parsing fails, use the raw value
                identityKey = identityKeyData;
            }
        }
        
        return new Response(JSON.stringify({ identityKey }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error fetching identity key:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch identity key" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}