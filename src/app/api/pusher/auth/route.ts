import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	let socket_id: string | null = null
	let channel_name: string | null = null

	const contentType = req.headers.get('content-type') || ''
	if (contentType.includes('application/json')) {
		const body = await req.json()
		socket_id = body?.socket_id ?? null
		channel_name = body?.channel_name ?? null
	} else {
		const rawBody = await req.text()
		const params = new URLSearchParams(rawBody)
		socket_id = params.get('socket_id')
		channel_name = params.get('channel_name')
	}

	console.log('Received Pusher auth request:', { socket_id, channel_name, userId: session.user.id });

	if (!socket_id || !channel_name) {
		return new Response('Bad Request', { status: 400 });
	}

	if (!channel_name.startsWith('presence-')) {
		return new Response('Forbidden', { status: 403 });
	}

	if (channel_name.startsWith('presence-chat__')) {
		const chatId = channel_name.replace('presence-chat__', '');
		const [userId1, userId2] = chatId.split('--');
		if (session.user.id !== userId1 && session.user.id !== userId2) {
			return new Response('Unauthorized', { status: 401 });
		}
	}

	const presenceData = {
		user_id: session.user.id,
		user_info: {
			name: session.user.name,
			image: session.user.image,
		},
	};

	const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, presenceData);

	return new Response(JSON.stringify(authResponse), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}