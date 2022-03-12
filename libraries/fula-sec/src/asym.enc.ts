import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { decryptJWE, createJWE, x25519Decrypter, x25519Encrypter } from 'did-jwt'
import * as u8a from 'uint8arrays'

interface IAsymEncryption {
    encrypt(symetricKey: string, CID: string, publicKey: any): any;
    decrypt(jwe: any): any;
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

    async encrypt(symetricKey: string, CID: string, publicKey: any) {
        let cleartext = u8a.fromString(JSON.stringify({ symetricKey: symetricKey,  CID: CID}));
        let asymEncrypter = this.asymEncrypter(publicKey);
        return await createJWE(cleartext, [asymEncrypter]);
    }

    async decrypt(jwe: any) {
        let asymDecrypter = this.asymDecrypter();
        return await decryptJWE(jwe, asymDecrypter);
    }

}