import { authOptions } from "@/lib/auth";
import { s3 } from "@/lib/S3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: NextRequest) {
  const { chatId } = await req.json();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chatUsers = chatId.split("--");

  if (
    session.user.id !== chatUsers[0] &&
    session.user.id !== chatUsers[1]
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const objectKey = `images/${chatId}/${crypto.randomUUID()}.bin`;

  const command = new PutObjectCommand({
    Bucket: "chat-files",
    Key: objectKey,
    ContentType: "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return Response.json({
    uploadUrl,
    objectKey,  
  });
}

