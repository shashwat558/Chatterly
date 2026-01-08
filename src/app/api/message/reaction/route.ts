import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { getServerSession } from "next-auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return new Response('Unauthorized', { status: 401 })

    const body = await req.json()
    const { chatId, messageId, reaction, timestamp } = body

    // 1. Fetch ALL messages from the chat to find the exact one
    const allMessages = await db.zrange(`chat:${chatId}:messages`, 0, -1, { withScores: true })
    
    if (!allMessages || allMessages.length === 0) {
        return new Response('No messages found', { status: 404 })
    }

    // 2. Find the target message and its index
    let targetMessage: any = null
    let targetScore: number = 0
    
    for (let i = 0; i < allMessages.length; i += 2) {
        const msg = allMessages[i] as any
        const score = allMessages[i + 1] as number
        
        const msgObj = typeof msg === 'string' ? JSON.parse(msg) : msg
        if (msgObj.id === messageId) {
            targetMessage = msgObj
            targetScore = score
            break
        }
    }

    if (!targetMessage) {
        return new Response('Message not found', { status: 404 })
    }

    // 3. Update reactions
    const userId = session.user.id
    const currentReactions = targetMessage.reactions || {}
    const userReactions = currentReactions[userId] || []

    let newUserReactions
    if (userReactions.includes(reaction)) {
        newUserReactions = userReactions.filter((r: string) => r !== reaction)
    } else {
        newUserReactions = [...userReactions, reaction]
    }

    if (newUserReactions.length > 0) {
        currentReactions[userId] = newUserReactions
    } else {
        delete currentReactions[userId]
    }

    const updatedMessage = {
        ...targetMessage,
        reactions: currentReactions
    }

    // 4. Update DB - Remove by score range and re-add
    // Use ZREMRANGEBYSCORE to remove messages at exact timestamp, then add updated one
    await db.zremrangebyscore(`chat:${chatId}:messages`, targetScore, targetScore)
    await db.zadd(`chat:${chatId}:messages`, { score: targetScore, member: JSON.stringify(updatedMessage) })

    // 5. Trigger Pusher
    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'message-update', updatedMessage)

    return new Response('OK')
  } catch (error) {
     console.error(error)
     return new Response('Internal Error', { status: 500 })
  }
}