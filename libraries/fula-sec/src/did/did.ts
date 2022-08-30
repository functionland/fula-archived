import { decryptJWE, createJWE, Encrypter, JWE, 
    xc20pDirEncrypter,
    xc20pDirDecrypter,
    x25519Encrypter,
    x25519Decrypter,
    xc20pAuthDecrypterEcdh1PuV3x25519WithXc20PkwV2,
    xc20pAuthEncrypterEcdh1PuV3x25519WithXc20PkwV2,
    createAnonEncrypter,
    createAnonDecrypter,
    createAuthEncrypter,
    createAuthDecrypter,
} from 'did-jwt'
import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { encodePayload, prepareCleartext, decodeCleartext } from 'dag-jose-utils'
import * as u8a from 'uint8arrays'

/**
 * @class AsymEncryption
 * @description Asymetric Encription
 * Requires public and private key. The user must import the DID`s private key and 
 * share the public key among network participants. 
 */
 interface IDIDEncDec {
    encrypt(symetricKey: string, CID: string, publicKey: any): Promise <any>;
    decrypt(jwe: any): Promise <any>;
}

export type CreateJWEOptions = {
    protectedHeader?: Record<string, any>
    aad?: Uint8Array
}

export type DecryptJWEOptions = {
    did?: string
}
  

export class DID {
    publicKey: any;
    private _privateKey: string;
    constructor(privateKey: any) {
        this.publicKey = generateKeyPairFromSeed(Buffer.from(privateKey, 'hex')).publicKey;
        this._privateKey = privateKey;
    }

    /**
     * This private function for encryption
     * @function encrypter() {x25519Encrypter}
     * @property publicKey array
     * @returns  encrypter = publicKey
     */

     private encrypter(publicKey: Array<string>): Array<any> {
        let encrypter: Array<any> = [];
        publicKey.forEach((_publicKey:any)=> encrypter.push(x25519Encrypter(new Uint8Array(_publicKey))))
        return encrypter
    }

     /**
     * This private function for decryption
     * @function asymDecrypter() {x25519Decrypter}
     * @property _privateKey
     * @returns  asymDecrypter = privateKey
     */
      private decrypter() {
        return x25519Decrypter(Buffer.from(this._privateKey, 'hex'));
    }

    /**
   * Create a JWE encrypted to the given recipients.
   *
   * @property cleartext           The cleartext to be encrypted
   * @property recipients          An array of DIDs
   * @property options             Optional parameters
   */
  async createJWE(
    cleartext: Record<string, any>,
    recipients: Array<string>,
    options: CreateJWEOptions = {}
  ): Promise<JWE> {
    let asymEncrypter = this.encrypter(recipients);
    const preparedCleartext = await prepareCleartext(cleartext)
    return createJWE(preparedCleartext, asymEncrypter, options.protectedHeader, options.aad)
  }

   /**
   * Try to decrypt the given JWE with the currently authenticated user.
   *
   * @property jwe                 The JWE to decrypt
   */

  async decryptJWE(jwe: JWE): Promise<Record<string, any>> {
    let decrypter = this.decrypter();
    const bytes = await decryptJWE(jwe, decrypter)
    return decodeCleartext(bytes)
  }
}