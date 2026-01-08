interface User {
    id: string
    name: string
    email: string 
    image: string
}


interface Chat {
    id: string
    message: Message[]
}

interface Message {
    id: string
    senderId: string
    recieverId: string
    text: string
    timestamp : number
    reactions?: Record<string, string[]>
}


interface FriendRequest {
    id: string
    senderId: string
    recieverId: string
}