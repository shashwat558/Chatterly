import { fetchRedis } from "@/helpers/redis";
import { addFriendValidator } from "@/lib/add-friend";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Console } from "console";
import { getServerSession } from "next-auth";
import { z, ZodError } from "zod";

export async function POST(req:Request) {
    try {
        const body = await req.json();
        //@ts-ignore
        const {email: emailToAdd} = addFriendValidator.safeParse(body.email);

        const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`, {
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            cache: 'no-store',
        })
        
        const data = await RESTResponse.json() as {result : string | null}
        const idToAdd = data.result
        if(!idToAdd) {
            return new Response("This person does not exist", {status: 400})
        }

        const session = await getServerSession(authOptions)

        if(!session) {
            return new Response("Unauthorised", {status: 401})
        }

        if(idToAdd === session.user.id){
            return new Response("Don't try to be Over smart dickhead", {status:400})
        }

        const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id)
        if(isAlreadyAdded) {
            return new Response('User already Added', {status: 400})
        }

        const isAlreadyFriend = (await fetchRedis(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAdd

        )) as 0 | 1
        if(isAlreadyFriend) {
            return new Response('Already a friend', {status: 400 })
        }

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)
        return new Response("OK")
           



    } catch (error) {
        if(error instanceof z.ZodError){
            return new Response("Invalid request paylaod", {status: 422})
        }

        return new Response("Invalid request paylaod", {status:422})
        
    }
}