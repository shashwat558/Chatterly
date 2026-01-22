import { initSodium } from "../utils"
import { ImageMessagePayload } from "../validations/message";

const sodium = await initSodium();

export async function encryptData(data: string | ImageMessagePayload, tx:Uint8Array){
    
    const nonce = sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES
    );

    const cipherText = sodium.crypto_secretbox_easy(
        typeof data === "string" ? sodium.from_string(data) : sodium.from_string(JSON.stringify(data)),
        nonce,
        tx
    )

    return {
        cipherText: sodium.to_base64(cipherText), nonce: sodium.to_base64(nonce)
    };
    
}

export async function decryptMessage(cipherText: string, rx:Uint8Array, nonce: string){
    
    const nonceUint8 = sodium.from_base64(nonce);
    const cipherTextUint8 = sodium.from_base64(cipherText);
    const plainText = sodium.crypto_secretbox_open_easy(
        cipherTextUint8,
        nonceUint8,
        rx
    );  
    return (sodium.to_string(plainText))
}

export async function encryptImage(imageData: Uint8Array){
    const nonceUint8 = sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES
    );

    const fileKey = sodium.randombytes_buf(
        sodium.crypto_secretbox_KEYBYTES
    );

    const encryptedImage = sodium.crypto_secretbox_easy(
        imageData,
        nonceUint8,
        fileKey
    );
    
    console.log("Encrypted image size:", encryptedImage.length);

    return {
        encryptedImage: sodium.to_base64(encryptedImage, sodium.base64_variants.ORIGINAL),
        fileKey: sodium.to_base64(fileKey),
        nonce: sodium.to_base64(nonceUint8)
    }



}

export async function decryptImage(encryptedImage: string, fileKey: string, nonce: string){
    const nonceUint8 = sodium.from_base64(nonce);
    const fileKeyUint8 = sodium.from_base64(fileKey);
    const encryptedImageUint8 = sodium.from_base64(encryptedImage , sodium.base64_variants.ORIGINAL);

    const decryptedImage = sodium.crypto_secretbox_open_easy(
        encryptedImageUint8,
        nonceUint8,
        fileKeyUint8
    );
    console.log("Decrypted image size:", decryptedImage.length);
    return decryptedImage;
}