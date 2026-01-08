import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { nanoid } from 'nanoid';
import { Message, messageValidator } from "@/lib/validations/message";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const { text, targetFriendIds }: { text: string; targetFriendIds: string[] } = await req.json();
        const session = await getServerSession(authOptions);

        if (!session) return new Response('Unauthorized', { status: 401 });

        const senderId = session.user.id;

        const rawSender = await fetchRedis('get', `user:${senderId}`);
        const sender = JSON.parse(rawSender) as User;


        const friendList = await fetchRedis('smembers', `user:${senderId}:friends`) as string[];
        
        const results = await Promise.all(
            targetFriendIds.map(async (friendId) => {
                if (!friendList.includes(friendId)) {
                    return { friendId, success: false, error: 'Not a friend' };
                }
                const chatId = [senderId, friendId].sort().join('--');

                const timestamp = Date.now();
                const messageData: Message = {
                    id: nanoid(),
                    senderId,
                    text: `↪️ ${text}`,
                    timestamp,
                    status: 'sent'
                };

                const message = messageValidator.parse(messageData);

                await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message);
                await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
                    ...message,
                    senderImage: sender.image,
                    senderName: sender.name
                });

                await db.zadd(`chat:${chatId}:messages`, {
                    score: timestamp,
                    member: JSON.stringify(message)
                });

                return { friendId, success: true };
            })
        );

        return new Response(JSON.stringify({ results }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Forward error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
