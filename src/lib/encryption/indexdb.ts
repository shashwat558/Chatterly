import {openDB} from 'idb';

const dbPromise = openDB("crypto-db", 1, {
    upgrade(db) {
        db.createObjectStore("keys");
    }
})

export async function getIdentityKey() {
    const db = await dbPromise;
    return db.get("keys", "identity");
}

export async function storeIdentityPrivateKey(privateKeyBase64: Base64URLString) {
    const db = await dbPromise;
    await db.put("keys", privateKeyBase64, "identity_private")
} 