import { authOptions } from "@/lib/auth";
import { s3 } from "@/lib/S3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
   const {objectKey, chatId} = await req.json();
   const session = await getServerSession(authOptions);

   if (!session) {
     return new Response("Unauthorized", { status: 401 });
   }

   const chatUsers = chatId.split("--");

   if(session.user.id !== chatUsers[0] && session.user.id !== chatUsers[1]){
     return new Response("Unauthorized", { status: 401 });
   }

   const command = new GetObjectCommand({
    Bucket: "chat-files",
    Key: objectKey
   });

   const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60
   });

   return Response.json({downloadUrl})
}