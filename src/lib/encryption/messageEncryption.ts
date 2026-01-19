import { initSodium } from "../utils"

const sodium = await initSodium();

export async function encryptMessage(message: string, tx:Uint8Array){
    
    const nonce = sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES
    );

    const cipherText = sodium.crypto_secretbox_easy(
        sodium.from_string(message),
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