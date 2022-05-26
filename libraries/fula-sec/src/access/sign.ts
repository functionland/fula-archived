import * as jose from 'jose'
import {getPublicJWK, getPrivateJWK} from './elliptic.key'
import isObjects from '../utils/isObject'
import { stringToBytes } from '../utils/u8a.multifoamats'
/*
    Generate Signature per content
    FulaSign is utility for creating Signature per content 
*/
interface IPayLoad {
    jweHash: any
    issuer: string
}

interface ISign {
    payload: IPayLoad
    signature: string | Uint8Array
}

export class ProduceSign {
    protected _payload!: Uint8Array

    constructor(options: ISign) {
        if (!isObjects(options)) {
            throw new TypeError('Set MUST be an object')
        }
        this._payload = stringToBytes(JSON.stringify(options.payload));
    }

    async sign(privateKey: any) {
        return await new jose.CompactSign(
            this._payload
          )
            .setProtectedHeader({ alg: 'ES256K' })
            .sign(privateKey)
    }

    async verify(signature: string | Uint8Array, publicKey: any) {
        return await jose.compactVerify(signature, publicKey)
    }
}