import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import sodium from "libsodium-wrappers";

export function cn(...inputs: ClassValue[]){
    return twMerge(clsx(inputs))

}

export  function toPusherKey(key: string){
    return key.replace(/:/g, '__')

}


export function chatHrefConstructor(id1: string, id2:string){
    const sortedIds = [id1, id2].sort();
    return `${sortedIds[0]}--${sortedIds[1]}`
    
}


export async function initSodium() {
    if(!sodium.ready) {
        await sodium.ready;
    }
    return sodium
}


