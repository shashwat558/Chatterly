
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const {chatId} = await req.json();
    const session = await getServerSession(authOptions);
    
    if(!session){
        return new Response("Unauthorized", {status: 401})
    };

    const chatUsers = chatId.split("--");
    if(!session.user.id === chatUsers[0] && !session.user.id === chatUsers[1]){
        return new Response("Unauthorized", {status: 401})
    };

    const randomUUID = crypto.randomUUID();

    const uploadUrl = `http://localhost:9001/chat-files/images/${chatId}/${randomUUID}.bin`;
    
    return new Response(JSON.stringify({uploadUrl}), {status: 200});

}