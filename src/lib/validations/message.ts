import { z } from "zod";

export const messageStatusEnum = z.enum(['sending', 'sent', 'delivered', 'seen'])
export type MessageStatus = z.infer<typeof messageStatusEnum>

export const replyToValidator = z.object({
    id: z.string(),
    senderId: z.string(),
    text: z.string(),
    senderName: z.string().optional()
})

export type ReplyTo = z.infer<typeof replyToValidator>

export const messageValidator = z.object({
    id: z.string(),
    senderId: z.string(),
    text: z.string().max(2000),
    timestamp: z.number(),
    reactions: z.record(z.array(z.string())).optional(),
    status: messageStatusEnum.optional(),
    replyTo: replyToValidator.optional()
})

export const messageArrayValidator = z.array(messageValidator)

export type Message = z.infer<typeof messageValidator>