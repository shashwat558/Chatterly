import { setSessionKeys } from "../sessionKeys";
import { initSodium } from "../utils";
import { getIdentityKey, getIdentityPrivateKey, storeIdentityPrivateKey } from "./indexdb";

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

export function amIClient(myUserId: string, otherUserId: string) {
    return myUserId < otherUserId;
}

export async function deriveSessionKeys(ourPublicKeyBase64: string, theirPublicKeyBase64: string, myUserId: string, otherUserId: string, chatId: string) {
    const sodium = await initSodium();
    let ourRecievingKey, ourSendingKey;
    const ourPrivateKeyBase64 = await getIdentityPrivateKey();
    if(!ourPrivateKeyBase64) {
        throw new Error("Our private key is not available");
    }
    const ourPrivatedKey = sodium.from_base64(ourPrivateKeyBase64);
    const theirPublicKey = sodium.from_base64(theirPublicKeyBase64);
    const ourPublicKey = sodium.from_base64(ourPublicKeyBase64);

    if(amIClient(myUserId, otherUserId)){
        const sessionKeys = sodium.crypto_kx_client_session_keys(
        ourPublicKey,
        ourPrivatedKey,
        theirPublicKey

    );
    ourRecievingKey = sessionKeys.sharedRx
    ourSendingKey = sessionKeys.sharedTx
    setSessionKeys(chatId, {rx: ourRecievingKey, tx: ourSendingKey});
    }

    else {
        const sessionKeys = sodium.crypto_kx_server_session_keys(
            ourPublicKey,
            ourPrivatedKey,
            theirPublicKey
        );
        ourRecievingKey = sessionKeys.sharedRx
        ourSendingKey = sessionKeys.sharedTx  
        setSessionKeys(chatId, {rx: ourRecievingKey, tx: ourSendingKey});
        
    }

    

}