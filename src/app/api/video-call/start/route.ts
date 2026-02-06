
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

   const { offer, partnerId } = await req.json()

   if (!offer || !partnerId) {
     return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 })
   }

   const callerId = session.user.id
   const callerName = session.user.name

   try {
     await pusherServer.trigger(
       toPusherKey(`user:${partnerId}:video-call`),
       'incoming-video-call',
       { offer, callerId, callerName }
     )
   } catch (error) {
     console.error('Error triggering Pusher event:', error)
   }

   return NextResponse.json({ success: true })
}