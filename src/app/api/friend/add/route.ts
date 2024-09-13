import { fetchRedis } from "@/helpers/redis";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

import { getServerSession } from "next-auth";
import { z, ZodError } from "zod";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Use safeParse to validate and parse the email
        const parseResult = addFriendValidator.safeParse(body);
        
        if (!parseResult.success) {
            // Handle validation error
            return new Response("Invalid request payload", { status: 422 });
        }

        const emailToAdd = parseResult.data.email;
        console.log(emailToAdd + "whatr");

        // Fetch user ID by email
        const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`, {
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            cache: 'no-store',
        });
        
        const data = await RESTResponse.json() as { result: string | null };
        console.log(data);

        const idToAdd = data.result;

        if (!idToAdd) {
            return new Response("This person does not exist", { status: 400 });
        }

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        if (idToAdd === session.user.id) {
            return new Response("Don't try to add yourself", { status: 400 });
        }

        // Check if the user is already added
        const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id);
        if (isAlreadyAdded) {
            return new Response('User already added', { status: 400 });
        }

        // Check if the user is already a friend
        const isAlreadyFriend = (await fetchRedis(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAdd
        )) as 0 | 1;
        
        if (isAlreadyFriend) {
            return new Response('Already a friend', { status: 400 });
        }

        await pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests',
            {
              senderId: session.user.id,
              senderEmail: session.user.email,
            }
          )

        // Add incoming friend request
        await fetchRedis('sadd', `user:${idToAdd}:incoming_friend_requests`, session.user.id);

        return new Response("OK");

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request payload", { status: 422 });
        }

        return new Response("An unexpected error occurred", { status: 500 });
    }
}
