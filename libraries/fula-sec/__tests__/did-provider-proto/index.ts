import { generateDid, pemToBuffer } from '../../src/did/utils/index.js'; 

export const getDidFromPem = async (pem:any) => {
    const key = await pemToBuffer(pem);
    return generateDid(key);
};

export const getDidFromBuffer = async (keyBuff:Uint8Array) => {
    return generateDid(keyBuff);
};