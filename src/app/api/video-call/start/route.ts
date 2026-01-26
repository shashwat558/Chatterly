import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
    await pusherServer.trigger('video-calls', 'start-call', {
        message: 'A video call has been started!'
    });

    return new Response('Video call started', { status: 200 });
}