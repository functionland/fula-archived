import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { decryptJWE, createJWE, x25519Decrypter, x25519Encrypter } from 'did-jwt'
import * as u8a from 'uint8arrays'
import { TextDecoder } from 'util';

interface IAsymEncryption {
    encrypt(symetricKey: string, CID: string, publicKey: any): Promise <any>;
    decrypt(jwe: any): Promise <any>;
}

export class AsymEncryption implements IAsymEncryption {
    publicKey: any;
    private _privateKey: string;
    constructor(privateKey: string) {
        this.publicKey = generateKeyPairFromSeed(Buffer.from(privateKey, 'hex')).publicKey;
        this._privateKey = privateKey;
    }

    private asymEncrypter(publicKey: any) {
       return x25519Encrypter(new Uint8Array(publicKey));
    }

    private asymDecrypter() {
        return x25519Decrypter(Buffer.from(this._privateKey, 'hex'));
    }

    encrypt(symetricKey: string, CID: string, publicKey: any) {
        return new Promise((resolve, reject) => {
            let cleartext = u8a.fromString(JSON.stringify({ symetricKey: symetricKey,  CID: CID}));
            let asymEncrypter = this.asymEncrypter(publicKey);
            createJWE(cleartext, [asymEncrypter])
                .then((jwe) => {
                    resolve(jwe)
                })
                .catch(error => {
                    reject(error);
                })
        })
    }

    decrypt(jwe: any) {
        return new Promise((resolve, reject) => {
            let asymDecrypter = this.asymDecrypter();
            decryptJWE(jwe, asymDecrypter)
                .then((uint8array) => {
                    resolve(JSON.parse(Buffer.from(uint8array.buffer).toString()));
                })
                .catch(error => {
                    reject(error);
                })
        })
    }

}