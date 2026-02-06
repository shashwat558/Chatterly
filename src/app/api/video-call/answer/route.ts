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

  const { answer, callerId } = await req.json()

  if (!answer || !callerId) {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 })
  }

  try {
    await pusherServer.trigger(
      toPusherKey(`user:${callerId}:video-call`),
      'video-call-answer',
      {
        answer,
        responderId: session.user.id,
        responderName: session.user.name,
      }
    )
  } catch (error) {
    console.error('Error triggering Pusher event:', error)
  }

  return NextResponse.json({ success: true })
}
