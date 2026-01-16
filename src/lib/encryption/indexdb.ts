import {openDB, IDBPDatabase} from 'idb';

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

function getDB() {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!dbPromise) {
        dbPromise = openDB("crypto-db", 1, {
            upgrade(db) {
                db.createObjectStore("keys");
            }
        });
    }
    return dbPromise;
}

export async function getIdentityKey() {
    const db = await getDB();
    if (!db) return null;
    return db.get("keys", "identity");
}

export async function storeIdentityPrivateKey(privateKeyBase64: string) {
    const db = await getDB();
    if (!db) return;
    await db.put("keys", privateKeyBase64, "identity_private");
}

export async function getIdentityPrivateKey() {
    const db = await getDB();
    if(!db) return null;
    return db.get("keys", "identity_private")
}