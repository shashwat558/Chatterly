import { initSodium } from "../utils";
import { getIdentityKey, storeIdentityPrivateKey } from "./indexdb";

export async function ensureIdentityKey(userId: string) {

    // Only run on client side
    if (typeof window === 'undefined') {
        return null;
    }

    const existingKey = await getIdentityKey();
    if(existingKey){
        return existingKey
    }

    const sodium = await initSodium();

    const keyPair = sodium.crypto_kx_keypair();
    
    await storeIdentityPrivateKey(sodium.to_base64(keyPair.privateKey));

    await fetch("api/keys/identity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            publicKey: sodium.to_base64(keyPair.publicKey),
            userId: userId
        })
    })

}
