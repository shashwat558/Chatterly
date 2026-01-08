import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return new Response('Unauthorized', { status: 401 })

    const body = await req.json()
    const { chatId, messageId, text, timestamp, senderId } = body

    const userId = session.user.id

    // Check if already bookmarked
    const existingBookmarks = await db.zrange(`user:${userId}:bookmarks`, 0, -1) as any[]
    const isBookmarked = existingBookmarks.some((b: any) => {
      const bookmark = typeof b === 'string' ? JSON.parse(b) : b
      return bookmark.messageId === messageId
    })

    if (isBookmarked) {
      // Remove bookmark
      const bookmarkToRemove = existingBookmarks.find((b: any) => {
        const bookmark = typeof b === 'string' ? JSON.parse(b) : b
        return bookmark.messageId === messageId
      })
      if (bookmarkToRemove) {
        await db.zrem(`user:${userId}:bookmarks`, typeof bookmarkToRemove === 'string' ? bookmarkToRemove : JSON.stringify(bookmarkToRemove))
      }
      return new Response(JSON.stringify({ bookmarked: false }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      // Add bookmark
      const bookmark = {
        messageId,
        chatId,
        text,
        timestamp,
        senderId,
        bookmarkedAt: Date.now()
      }
      await db.zadd(`user:${userId}:bookmarks`, { 
        score: Date.now(), 
        member: JSON.stringify(bookmark) 
      })
      return new Response(JSON.stringify({ bookmarked: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error(error)
    return new Response('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return new Response('Unauthorized', { status: 401 })

    const userId = session.user.id
    const bookmarks = await db.zrange(`user:${userId}:bookmarks`, 0, -1, { rev: true }) as any[]

    const parsedBookmarks = bookmarks.map((b: any) => 
      typeof b === 'string' ? JSON.parse(b) : b
    )

    return new Response(JSON.stringify(parsedBookmarks), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error(error)
    return new Response('Internal Error', { status: 500 })
  }
}
