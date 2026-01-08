import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { chatId, isTyping } = await req.json()

    if (!chatId) {
      return new Response('Missing chatId', { status: 400 })
    }

    // Verify user is part of this chat
    const [userId1, userId2] = chatId.split('--')
    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Trigger typing event to the chat channel
    await pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      'typing-indicator',
      {
        userId: session.user.id,
        userName: session.user.name,
        isTyping
      }
    )

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Typing indicator error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
