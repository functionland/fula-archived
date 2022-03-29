import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { decryptJWE, createJWE, x25519Decrypter, x25519Encrypter } from 'did-jwt'
import * as u8a from 'uint8arrays'
/**
 * @class AsymEncryption
 * @description Asymetric Encription
 * Requires public and private key. The user must import the DID`s private key and 
 * share the public key among network participants. 
 */
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

    /**
     * This private function for encryption
     * @function asymEncrypter() {x25519Encrypter}
     * @property publicKey array
     * @returns  asymEncrypter = publicKey
     */

    private asymEncrypter(publicKey: Array<string>): Array<any> {
        let asymEncrypter: Array<any> = [];
        publicKey.forEach((_publicKey:any)=> asymEncrypter.push(x25519Encrypter(new Uint8Array(_publicKey))))
        return asymEncrypter
    }

     /**
     * This private function for decryption
     * @function asymDecrypter() {x25519Decrypter}
     * @property _privateKey
     * @returns  asymDecrypter = privateKey
     */
    private asymDecrypter() {
        return x25519Decrypter(Buffer.from(this._privateKey, 'hex'));
    }

    /**
     * Encrypt with Audience`s Public Key
     * @function encrypt()
     * @property symetricKey: string, CID: string, publicKey: array
     * @returns  jwe {} || error
     */
    encrypt(symetricKey: string, CID: string, publicKey: Array<string>) {
        return new Promise((resolve, reject) => {
            let cleartext = u8a.fromString(JSON.stringify({ symetricKey: symetricKey,  CID: CID}));
            let asymEncrypter = this.asymEncrypter(publicKey);
            createJWE(cleartext, asymEncrypter)
                .then((jwe) => {
                    resolve(jwe)
                })
                .catch(error => {
                    reject(error);
                })
        })
    }

    /**
     * Decrypt with own Private Key
     * @function decrypt()
     * @property jwe {}
     * @returns  decrypted message {symetricKey: string, CID: string}
     */

    decrypt(jwe: any): Promise <any> {
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