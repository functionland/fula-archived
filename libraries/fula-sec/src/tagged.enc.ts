import { JWE } from 'did-jwt'
/**
 * @class TaggedEncryption
 * @description TaggedEncryption is DID id attached Encription
 * Not required publick and private keys, only add didAudience.
 */
 export interface ITagEncryption {
    didAudience: string;
    symetricKey: any;
    accessKey: string;
    encrypt(symetricKey: any, accessKey: string, didAudience: Array<string>): Promise<any>;
    decrypt(jwe: any): Promise<any>;    
}

export class TaggedEncryption implements ITagEncryption {
    private _did: any;
    didAudience!: string;
    symetricKey!: string
    accessKey!: string;

    constructor (DID: any) {
      this._did = DID;
    }

     /**
     * This function encrtps user`s accessKey and shared symetric keys
     * @function encrypt()
     * @property symetricKey: string, accessKey: string, didAudience: array
     * @returns  jwe {}
     */
    async encrypt(symetricKey: string, accessKey: string, didAudience: Array<string>): Promise<JWE> {
      return await this._did.createDagJWE({symetricKey, accessKey}, didAudience)
    }

    /**
     * This function decrypts user`s accessKey and shared symetric keys
     * @function decrypt()
     * @property jwe {}
     * @returns  decrypted message {symetricKey: string, accessKey: string}
     */
    async decrypt(jwe: JWE): Promise<Record<string, any>> {
      return await this._did.decryptDagJWE(jwe);
    }
}