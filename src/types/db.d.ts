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

interface ReplyTo {
    id: string
    senderId: string
    text: string
    senderName?: string
}

interface Message {
    id: string
    senderId: string
    recieverId: string
    text: string
    timestamp: number
    reactions?: Record<string, string[]>
    status?: 'sending' | 'sent' | 'delivered' | 'seen'
    replyTo?: ReplyTo
}


interface FriendRequest {
    id: string
    senderId: string
    recieverId: string
}