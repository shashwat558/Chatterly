import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { candidate, partnerId } = await req.json()

  if (!candidate || !partnerId) {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 })
  }

  try {
    await pusherServer.trigger(
      toPusherKey(`user:${partnerId}:video-call`),
      'ice-candidate',
      {
        candidate,
        senderId: session.user.id,
      }
    )
  } catch (error) {
    console.error('Error triggering ICE candidate:', error)
  }

  return NextResponse.json({ success: true })
}
