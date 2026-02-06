import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
   const {offer, partnerId} = await req.json();
   const partnerName = await db.get(`user:${partnerId}:name`)
   console.log('Received offer for video call:', { offer, partnerId, partnerName });
   try {
     await pusherServer.trigger(toPusherKey(`user:${partnerId}:video-call`), 'incoming-video-call', { offer, partnerName })
   } catch (error) {
        console.error('Error triggering Pusher event:', error);    
   }
   return NextResponse.json({ success: true });
}