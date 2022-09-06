import { decryptJWE, createJWE, JWE,
    x25519Encrypter,
    x25519Decrypter,
    Encrypter,
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
    publicKey: Uint8Array;
    private _privateKey: Uint8Array;
    constructor(privateKey: Uint8Array, publicKey: Uint8Array) {
      this.publicKey = publicKey
      this._privateKey = privateKey;
    }

    /**
     * This private function for encryption
     * @function encrypter() {x25519Encrypter}
     * @property publicKey array
     * @returns  encrypter = publicKey
     */

     private encrypter(publicKey: Array<Uint8Array>): Encrypter[] {
        let encrypter: Encrypter[] = [];
        publicKey.forEach((_publicKey:any)=> encrypter.push(x25519Encrypter(u8a.fromString(_publicKey))))
        console.log('>> encrypter: ', encrypter)
        return encrypter
    }

     /**
     * This private function for decryption
     * @function asymDecrypter() {x25519Decrypter}
     * @property _privateKey
     * @returns  asymDecrypter = privateKey
     */
      private decrypter() {
        return x25519Decrypter(this._privateKey);
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
    recipients: Encrypter[] | Array<Uint8Array>,
    options: CreateJWEOptions = {}
  ): Promise<JWE> {
    if(!recipients.map((key:any)=>  { return key.alg }).includes('ECDH-ES+XC20PKW')) {
      recipients = this.encrypter(recipients as Array<Uint8Array>);
    }
    const preparedCleartext = await prepareCleartext(cleartext);
    return await createJWE(preparedCleartext, recipients as Encrypter[], options.protectedHeader, options.aad)
  }

   /**
   * Try to decrypt the given JWE with the currently authenticated user.
   *
   * @property jwe                 The JWE to decrypt
   */

  async decryptJWE(jwe: JWE): Promise<Record<string, any>> {
    let decrypter = this.decrypter();
    console.log('decrypter: ', decrypter)
    const bytes = await decryptJWE(jwe, decrypter)
    console.log('bytes: ', bytes)
    return decodeCleartext(bytes)
  }
}