import * as crypto from 'libp2p-crypto';
import { Buffer } from 'buffer';
import * as PeerId from 'peer-id'
import { InvalidDid } from './errors.js';

export const getDidFromPem = async (pem:any) => {
    const key = await pemToBuffer(pem);
    return generateDid(key);
};

export const getDidFromParentKey = async (parentKey: Uint8Array) => {
    const key = await parentKeyToBuffer(parentKey);
    return generateDidFromParent(key);
};
export const parentKeyToBuffer = async (parentKey: Uint8Array) => {
    return await crypto.keys.generateKeyPairFromSeed('Ed25519', parentKey, 512) 
};

export const generateDidFromParent = async (key:crypto.PrivateKey) => {
    const identifier = await generateIpnsNameFromParent(key);
    const did = `did:fula:${identifier.toB58String()}`;
    return {
       PeerId: identifier.toJSON(),
       did 
    }
};

export const generateIpnsNameFromParent = async (key: crypto.PrivateKey) => {
    let _privateKey = crypto.keys.marshalPrivateKey(key, 'ed25519')
    const peerId = await PeerId.createFromPrivKey(_privateKey);
    return peerId;
};

export const pemToBuffer = async (pem: any, password?: any) => {
        const key = await crypto.keys.import(pem, password);
        return key.bytes;
};

export const generateIpnsName = async (key: any) => {
    const peerId = await PeerId.createFromPrivKey(Buffer.from(key));
    return peerId.toB58String();
};

export const generateDid = async (key:any) => {
    const identifier = await generateIpnsName(key);

    return `did:fula:${identifier}`;
};

export const parseDid = (did: any) => {
    const match = did.match(/did:(\w+):(\w+).*/);

    if (!match) {
        throw new InvalidDid(did);
    }

    return { method: match[1], identifier: match[2] };
};

export const isDidValid = (did: any) => {
    try {
        parseDid(did);

        return true;
    } catch (err) {
        return false;
    }
};

export const generateRandomString = async() =>
    Math.random()
    .toString(36)
    .substring(2);
