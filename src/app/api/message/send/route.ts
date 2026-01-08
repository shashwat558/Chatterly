import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

import {nanoid} from 'nanoid';
import { Message, messageArrayValidator, messageValidator, ReplyTo } from "@/lib/validations/message";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
export async function POST(req:Request) {
   try {
       
    const {text, chatId, messageId, timestamp: clientTimestamp, replyTo}: {text: string, chatId: string, messageId?: string, timestamp?: number, replyTo?: ReplyTo} = await req.json();
    const session = await getServerSession(authOptions);

    if(!session) return new Response('Unauthorized', {status: 401})

    const [userId1, userId2] = chatId.split('--');

    if(session.user.id !== userId1 && session.user.id !== userId2){
        return new Response('Unauthorized', {status: 401})
    }

    const friendId = session.user.id === userId1? userId2: userId1;

    const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[];
    const isFriend = friendList.includes(friendId);
    if(!isFriend){
        return new Response("Unauthorized", {status: 401})
    }
    const rawSender = await fetchRedis('get', `user:${session.user.id}`) 
    const sender = JSON.parse(rawSender) as User;

    const timestamp = clientTimestamp || Date.now()

    const messageData: Message = {
        id: messageId || nanoid(),
        senderId: session.user.id,
        text,
        timestamp,
        status: 'sent',
        replyTo: replyTo || undefined
    }

    const message = messageValidator.parse(messageData);


    await pusherServer.trigger(toPusherKey(`chat:${chatId}`, ), `incoming-message`, message);
    await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
        ...message,
        senderImage: sender.image,
        snederName: sender.name
    })

    //now send the message
    await db.zadd(`chat:${chatId}:messages`, {
        score: timestamp,
        member: JSON.stringify(message)
    })
    return new Response("OK")
   } catch (error) {
    if(error instanceof z.ZodError){
        return new Response(error.message, {status: 500})
    }
     return new Response('Internal server Error ', {status: 500})
   }



 
}