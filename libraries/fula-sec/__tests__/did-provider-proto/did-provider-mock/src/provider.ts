import type IPFS from 'ipfs-core-types'
import all from 'it-all';
import {CID} from 'multiformats/cid'
import type { VerificationMethod, Resolvable } from 'did-resolver'
import * as u8a from 'uint8arrays'
import { Encrypter, x25519Encrypter } from 'did-jwt';
import createDocument, { assertDocument } from '../../../../src/did/document/index.js';
import { generateRandomString } from '../../../../src/did/utils/index.js';
import { InvalidDid, IllegalCreate } from '../../../../src/did/utils/errors.js';
import * as crypto from 'libp2p-crypto';
import { DID } from '../../../../src/did/did.js' 
export class Povider {
    _ipfs: IPFS.IPFS;
    _lifetime: any;
    _secretKey: Uint8Array;

    constructor(ipfs: IPFS.IPFS, lifetime: any, secretKey: Uint8Array) {
        this._ipfs = ipfs;
        this._lifetime = lifetime || '87600h';
        this._secretKey = secretKey;
    }

    async resolve(did:any) {
        const { identifier } = DID.parseDID(did);
        try {
            const path:any = await all(this._ipfs.name.resolve(identifier));
            if(!path) return false
            const cidStr:any = path[0].replace(/^\/ipfs\//, '');
            //https://bytemeta.vip/repo/ipfs/js-ipfs/issues/3854
            let cid = CID.parse(cidStr)
            const { value: content } = await this._ipfs.dag.get(cid);
            assertDocument(content);
            return content;
        } catch (err: any) {
            if (err.code === 'INVALID_DOCUMENT') {
                throw err;
            }

            throw new InvalidDid(did, `Unable to resolve document with DID: ${did}`, { originalError: err.message });
        }
    }

    async resolveEncrypters(dids: string[]): Promise<Encrypter[]> {
        const encryptersForDID = async (did: string, resolved: string[] = []): Promise<Encrypter[]> => {
          const didDocument = await this.resolve(did)
          resolved.push(did)
          if (!didDocument.publicKey) {
            throw new Error(`no_suitable_keys: Could not find x25519 key for ${did}`)
          }
          const agreementKeys: VerificationMethod[] = didDocument.publicKey
            ?.map((key: any) => {
              if (typeof key === 'string') {
                return [...(didDocument.publicKey || [])].find(
                  (pk) => pk.id === key
                )
              }
              return key
            })
            ?.filter((key: any) => typeof key !== 'undefined') as VerificationMethod[]
          const pks =
            agreementKeys?.filter((key) => {
              return key.type === 'X25519KeyAgreementKey2019' && Boolean(key.publicKeyBase58)
            }) || []
          if (!pks.length)
            throw new Error(`no_suitable_keys: Could not find x25519 key for ${did}`)
            return pks
            .map((pk) => x25519Encrypter(u8a.fromString(<string>pk.publicKeyBase58, 'base58btc'), pk.id))
        }
      
        const encrypterPromises = dids.map((did) => encryptersForDID(did))
        const encrypterArrays = await Promise.all(encrypterPromises)
        const flattenedArray = ([] as Encrypter[]).concat(...encrypterArrays)
        return flattenedArray
      }

    async create(did: any, operations: any) {
        try {
            const document = createDocument(did);
            operations(document);
            return this._publish(document.getContent());
        } catch (err) {
            return err
        }
        throw new IllegalCreate();
    }

    async update(did: any, operations:any) {
        const content = await this.resolve(did);
        const document = createDocument(did, content);
        operations(document);
        return this._publish(document.getContent());
    }

    _publish = async (content:any) => {
      const keyName = await this._generateKeyName();
      let pem = await this._getKey('123456')
        try {
          await this._importKey(keyName, pem, '123456');
            const cid = await this._ipfs.dag.put(content, { storeCodec: 'dag-cbor', hashAlg: 'sha2-512' });
            const path = `/ipfs/${cid}`;
            const res = await this._ipfs.name.publish(path, {
                lifetime: this._lifetime,
                ttl: this._lifetime,
                key: keyName
            });
            return content;
        } finally {
            await this._removeKey(keyName);
        }
    }
  
    _removeKey = async (keyName:any) => {
        const keysList = await this._ipfs.key.list();
        const hasKey = keysList.some(({ name }) => name === keyName);
        if (!hasKey) {
            return;
        }
        const key = await this._ipfs.key.rm(keyName);
    }

    _importKey = async (keyName:any, pem:any, password?:any) => {
      await this._removeKey(keyName);
      await this._ipfs.key.import(keyName, pem, password);
    }

    _getKey = async(password: string) => {
      const key = await crypto.keys.generateKeyPairFromSeed('Ed25519', this._secretKey, 512)      
      return key.export(password)
    }

    _generateKeyName = async() =>
        `fula-did-${await generateRandomString()}`;
}