type sessionKeyPair = {
    tx: Uint8Array,
    rx: Uint8Array
}

const sessionKeyStore = new Map<string, sessionKeyPair>();

export function getSessionKeys(chatId: string) {
    return sessionKeyStore.get(chatId);
}

export function setSessionKeys(chatId:string, keys: sessionKeyPair){
    sessionKeyStore.set(chatId, keys);
}

export function hasSessionKeys(chatId: string){
    return sessionKeyStore.has(chatId)
};

export function clearSessionKeys(chatId: string) {
    return sessionKeyStore.delete(chatId)
}