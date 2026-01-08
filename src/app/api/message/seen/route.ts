import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const { chatId, messageIds }: { chatId: string; messageIds: string[] } = await req.json();
        const session = await getServerSession(authOptions);

        if (!session) return new Response('Unauthorized', { status: 401 });

        const [userId1, userId2] = chatId.split('--');

        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Unauthorized', { status: 401 });
        }

        const senderId = session.user.id === userId1 ? userId2 : userId1;
        const messagesRaw = await db.zrange(`chat:${chatId}:messages`, 0, -1, { withScores: true });
        
        if (!messagesRaw || messagesRaw.length === 0) {
            return new Response('No messages found', { status: 404 });
        }

        for (let i = 0; i < messagesRaw.length; i += 2) {
            const messageRaw = messagesRaw[i];
            const score = messagesRaw[i + 1] as number;
            
            let message: any;
            if (typeof messageRaw === 'string') {
                try {
                    message = JSON.parse(messageRaw);
                } catch {
                    message = messageRaw;
                }
            } else {
                message = messageRaw;
            }

            if (message.senderId === senderId && messageIds.includes(message.id) && message.status !== 'seen') {
                const updatedMessage = { ...message, status: 'seen' };

                await db.zremrangebyscore(`chat:${chatId}:messages`, score, score);
                await db.zadd(`chat:${chatId}:messages`, {
                    score: message.timestamp,
                    member: JSON.stringify(updatedMessage)
                });


                await pusherServer.trigger(
                    toPusherKey(`chat:${chatId}`),
                    'message-status',
                    { messageId: message.id, status: 'seen' }
                );
            }
        }

        return new Response('OK');
    } catch (error) {
        console.error('Error marking messages as seen:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
