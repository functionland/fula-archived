/**
 * @class TaggedEncryption
 * @description TaggedEncryption is DID id attached Encription
 * Not required publick and private keys, only add didAudience.
 */

 interface ITagEncryption {
    didAudience: string;
    symetricKey: any;
    encrypt(symetricKey: any, accessKey: string, didAudience: Array<string>): Promise<any>;
    decrypt(jwe: any): Promise<any>;
}

export class TaggedEncryption implements ITagEncryption {
    private _did: any;
    didAudience!: string;
    symetricKey!: any

    constructor (DID: any) {
      this._did = DID;
    }

     /**
     * This function encrtps user`s accessKey and shared symetric keys
     * @function encrypt()
     * @property symetricKey: object, accessKey: string, didAudience: array
     * @returns  jwe {}
     */
    async encrypt(symetricKey: any, accessKey: string, didAudience: Array<string>): Promise<any> {
        return await this._did.createDagJWE({symetricKey, accessKey}, didAudience)
    }

    /**
     * This function decrypts user`s accessKey and shared symetric keys
     * @function decrypt()
     * @property jwe {}
     * @returns  decrypted message {symetricKey: object, accessKey: string}
     */
    async decrypt(jwe: any): Promise<any>  {
        return await this._did.decryptDagJWE(jwe);
    }
}