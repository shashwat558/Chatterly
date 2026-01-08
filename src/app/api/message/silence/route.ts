import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { z } from "zod"

// Silence status types
export type SilenceStatus = 'no_reply_needed' | 'waiting_for_info' | 'will_reply_later'

// TTL in seconds (6 hours)
const SILENCE_TTL = 6 * 60 * 60

const silenceSchema = z.object({
  messageId: z.string(),
  chatId: z.string(),
  status: z.enum(['no_reply_needed', 'waiting_for_info', 'will_reply_later']),
})

// POST - Set silence status with TTL
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { messageId, chatId, status } = silenceSchema.parse(body)

    const userId = session.user.id
    const silenceKey = `silence:${messageId}:${userId}`

    // Set the silence status with TTL using SETEX
    await db.setex(silenceKey, SILENCE_TTL, status)

    // Notify the chat partner via Pusher
    await pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      'silence-status',
      {
        messageId,
        userId,
        userName: session.user.name,
        status,
        expiresAt: Date.now() + (SILENCE_TTL * 1000)
      }
    )

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Silence status error:', error)
    if (error instanceof z.ZodError) {
      return new Response('Invalid request data', { status: 422 })
    }
    return new Response('Internal Server Error', { status: 500 })
  }
}

// GET - Get silence status for messages in a chat
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('chatId')
    const messageIds = searchParams.get('messageIds')?.split(',') || []

    if (!chatId || messageIds.length === 0) {
      return new Response('Missing chatId or messageIds', { status: 400 })
    }

    // Get the chat partner ID from chatId
    const [userId1, userId2] = chatId.split('--')
    const partnerId = userId1 === session.user.id ? userId2 : userId1

    // Fetch silence statuses for all messages from the partner
    const silenceStatuses: Record<string, { status: SilenceStatus; expiresAt: number } | null> = {}

    await Promise.all(
      messageIds.map(async (messageId) => {
        const silenceKey = `silence:${messageId}:${partnerId}`
        const status = await db.get<SilenceStatus>(silenceKey)
        
        if (status) {
          // Get TTL to calculate expiration
          const ttl = await db.ttl(silenceKey)
          silenceStatuses[messageId] = {
            status,
            expiresAt: Date.now() + (ttl * 1000)
          }
        } else {
          silenceStatuses[messageId] = null
        }
      })
    )

    return new Response(JSON.stringify(silenceStatuses), { status: 200 })
  } catch (error) {
    console.error('Get silence status error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

// DELETE - Clear silence status
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { messageId, chatId } = body

    if (!messageId) {
      return new Response('Missing messageId', { status: 400 })
    }

    const userId = session.user.id
    const silenceKey = `silence:${messageId}:${userId}`

    await db.del(silenceKey)

    // Notify via Pusher
    if (chatId) {
      await pusherServer.trigger(
        toPusherKey(`chat:${chatId}`),
        'silence-cleared',
        {
          messageId,
          userId
        }
      )
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Clear silence status error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
