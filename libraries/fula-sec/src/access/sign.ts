import * as jose from 'jose'
import {getPublicJWK, getPrivateJWK} from './elliptic.key'
import isObjects from '../utils/isObject'
import { stringToBytes } from '../utils/u8a.multifoamats'
/*
    Generate Signature per content
    FulaSign is utility for creating Signature per content 
*/
interface ISigPayLoad {
    jwe: any
    CID: string,
    issuer: string,
    audience: string
}

export class ProduceSign {
    protected _payload!: Uint8Array

    setSignOption(options: ISigPayLoad) {
        if (!isObjects(options)) {
            throw new TypeError('Set MUST be an object')
        }
        this._payload = stringToBytes(JSON.stringify(options));
    }

    async signKey(privateKey: any) {
        return await new jose.CompactSign(
            this._payload
          )
            .setProtectedHeader({ alg: 'ES256K' })
            .sign(privateKey)
    }

    async verifySign(signature: string | Uint8Array, publicKey: any) {
        return await jose.compactVerify(signature, publicKey)
    }
}