import { decryptJWE, createJWE, JWE,
    x25519Encrypter,
    x25519Decrypter,
    Encrypter,
} from 'did-jwt'
import {prepareCleartext, decodeCleartext } from 'dag-jose-utils'
import * as u8a from 'uint8arrays'
import * as crypto from 'libp2p-crypto';
import { Buffer } from 'buffer';
import * as PeerId from 'peer-id'
import { InvalidDid } from '../did/utils/errors.js';
/**
 * @class Decentralized Identity and JWE
 * @description Asymetric Encription
 * Requires public and private key. The user must import the DID`s private key and 
 * share the public key among network participants. 
 */

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
     * This function for generating DID and PeerID
     * @function getDID()
     * @property parentKey?: Uin8Array (Optinal) or _privateKey (default)
     * @returns  {
     *  PeerId, did 
     * }
    */

    async getDID (parentKey?: Uint8Array): Promise<{
      PeerId: PeerId.JSONPeerId;
      did: string;
    }> {
      const key = await this._keyPair(parentKey || this._privateKey);
      return this._generateDID(key);
    }

     /**
     * This private helper function for generate key pair
     * @function _keyPair()
     * @property parentKey: Uin8Array
     * @returns  Public and PrivateKeys for peerId
     */
 
    private async _keyPair (parentKey: Uint8Array):Promise<crypto.keys.supportedKeys.ed25519.Ed25519PrivateKey> {
      return await crypto.keys.generateKeyPairFromSeed('Ed25519', parentKey, 512) 
    };

    /**
     * This private helper function for generate DID
     * @function _generateDID()
     * @property key: crypto.PrivateKey
     * @returns  { PeerId: identifier.toJSON(), did }
     */

    private async _generateDID (key: crypto.PrivateKey): Promise<{
      PeerId: PeerId.JSONPeerId;
      did: string;
    }> {
      const identifier = await this._createPeerId(key);
      const did = `did:fula:${identifier.toB58String()}`;
      return {
         PeerId: identifier.toJSON(),
         did 
      }
    };
     
    /**
     * This private helper function for generate peer-id
     * @function _createPeerId()
     * @property key: crypto.PrivateKey
     * @returns  PeerId
     */

    private async _createPeerId (key: crypto.PrivateKey): Promise<PeerId> {
      let _privateKey = crypto.keys.marshalPrivateKey(key, 'ed25519')
      const peerId = await PeerId.createFromPrivKey(_privateKey);
      return peerId;
    };

     /**
     * This function for parseDID
     * @function parseDID()
     * @property did: string
     * @returns  did
     */

    parseDID(did: string) {
      const match = did.match(/did:(\w+):(\w+).*/);
      if (!match) {
          throw new InvalidDid(did);
      }
      return { method: match[1], identifier: match[2] };
    }


     /**
     * This function for checking if did valid format
     * @function isValidDID()
     * @property did: string
     * @returns  boolen
     */

    isValidDID(did: string) {
      try {
        this.parseDID(did);
        return true;
      } catch (err) {
        return false;
      }
    }

    /**
     * This private function for encryption
     * @function encrypter() {x25519Encrypter}
     * @property publicKey array
     * @returns  encrypter = publicKey
     */

    private _encrypter(publicKey: Array<Uint8Array>): Encrypter[] {
      let encrypter: Encrypter[] = [];
      publicKey.forEach((_publicKey:any)=> encrypter.push(x25519Encrypter(u8a.fromString(_publicKey))))
      return encrypter
    }

     /**
     * This private function for decryption
     * @function asymDecrypter() {x25519Decrypter}
     * @property _privateKey
     * @returns  asymDecrypter = privateKey
     */

    private _decrypter() {
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
      recipients = this._encrypter(recipients as Array<Uint8Array>);
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
      let decrypter = this._decrypter();
      const bytes = await decryptJWE(jwe, decrypter)
      return decodeCleartext(bytes)
    }
}