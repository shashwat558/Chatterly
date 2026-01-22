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

export const imageMessagePayload = z.object({
    type: z.literal("image"),
    url: z.string().url(),
    nonce: z.string(),
    fileKey: z.string(),
    size: z.number()
})

export const messageValidator = z.object({
    id: z.string(),
    senderId: z.string(),
    text: z.string().max(2000),
    nonce: z.string().optional(),
    imageUrl: z.string().url().optional(),
    imagePayloadNonce: z.string().optional(),
    timestamp: z.number(),
    reactions: z.record(z.array(z.string())).optional(),
    status: messageStatusEnum.optional(),
    replyTo: replyToValidator.optional(),
    imagePayload: imageMessagePayload.optional()
});

export const MAX_IMAGE_LENGTH = 1 * 1024 * 1024;

export const allowedImageTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml"
];


export type ImageMessagePayload = z.infer<typeof imageMessagePayload>

export const messageArrayValidator = z.array(messageValidator)

export type Message = z.infer<typeof messageValidator>