import { initSodium } from "../utils";
import { getIdentityKey, storeIdentityPrivateKey } from "./indexdb";

export async function ensureIdentityKey() {
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

    return keyPair;

}
