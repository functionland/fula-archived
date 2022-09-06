// import type IPFS from 'ipfs-core-types'
import all from 'it-all';
import {CID} from 'multiformats/cid'
import type { VerificationMethod, Resolvable } from 'did-resolver'
import * as u8a from 'uint8arrays'
import { Encrypter, x25519Encrypter } from 'did-jwt';
import createDocument, { assertDocument } from '../../../../src/did/document/index.js';
import { generateRandomString, parseDid } from '../../../../src/did/utils/index.js';
import { InvalidDid, IllegalCreate } from '../../../../src/did/utils/errors.js';
import {getDidFromPem} from '../../index.js'

export class Povider {
    _ipfs: any;
    _lifetime: any;

    constructor(ipfs: any, lifetime: any) {
        this._ipfs = ipfs;
        this._lifetime = lifetime || '87600h';
    }

    async resolve(did:any) {
        const { identifier } = parseDid(did);
        console.log('identifier: ', identifier)
        try {
            const path:any = await all(this._ipfs.name.resolve(identifier));
            console.log('path: ', path)
            if(!path) return false
            const cidStr:any = path[0].replace(/^\/ipfs\//, '');
            console.log('cidStr: ', cidStr)
            //https://bytemeta.vip/repo/ipfs/js-ipfs/issues/3854
            let cid = CID.parse(cidStr)
            console.log('cid:>> ', cid)
            const { value: content } = await this._ipfs.dag.get(cid);
            console.log('content: ', content)
            assertDocument(content);
            return content;
        } catch (err: any) {
            console.log('err: ', err)
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

    async create(pem: any, operations: any) {
        const did = await getDidFromPem(pem);
        try {
            const document = createDocument(did);
            operations(document);
            return this._publish(pem, document.getContent());
        } catch (err) {
            return err
        }
        throw new IllegalCreate();
    }

    async update(pem: any, operations:any) {
        const did = await getDidFromPem(pem);

        const content = await this.resolve(did);
        const document = createDocument(did, content);

        operations(document);

        return this._publish(pem, document.getContent());
    }

    _publish = async (pem:any, content:any) => {
        const keyName:any = await this._generateKeyName();
        console.log('keyName: ', keyName)
        console.log('content: ', content)
        await this._importKey(keyName, pem);
        try {
            const cid = await this._ipfs.dag.put(content, { storeCodec: 'dag-cbor', hashAlg: 'sha2-512' });
            const path = `/ipfs/${cid}`;
            console.log('path: ', path)
            const res = await this._ipfs.name.publish(path, {
                lifetime: this._lifetime,
                ttl: this._lifetime,
                key: keyName,
            });
            return content;
        } finally {
            await this._removeKey(keyName);
        }
    }

    _removeKey = async (keyName:any) => {
        console.log('>> keyName: ', keyName)
        const keysList = await this._ipfs.key.list();
        const hasKey = keysList.some(({ name }) => name === keyName);

        if (!hasKey) {
            return;
        }

        const key = await this._ipfs.key.rm(keyName);
        console.log('rm key: ', key)
    }

    _importKey = async (keyName:any, pem:any, password?:any) => {
        // await this._removeKey(keyName);
        const key = await this._ipfs.key.import(keyName, pem, password);
        console.log('import key: ', key)
    }

    _generateKeyName = async() =>
        `fula-did-${await generateRandomString()}`;
}