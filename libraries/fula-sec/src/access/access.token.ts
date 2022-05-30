import * as jose from 'jose'
import { ProduceAccessKey } from './sign'
import isObjects from '../utils/isObject'
import { stringToBytes, bytesToString, randomKey } from '../utils/u8a.multifoamats'
import {getPublicJWK, getPrivateJWK} from './elliptic.key'
import { bytes } from 'multiformats'
let sha3 = require('js-sha3');

interface IAccessHeader {
    payload: any
    issuer:string
    audience: string
    expt?: string | undefined
}

export class ProtectedAccessHeader extends ProduceAccessKey {
    private _issuer!: string
    private _audience!: string
    private _expt?: string | undefined
    protected _payload: any

    setDeclaration(options: IAccessHeader) {
        if (!isObjects(options)) {
            throw new TypeError('Set MUST be an object')
        }
        this._payload = options.payload;
        this._issuer = options.issuer;
        this._audience = options.audience;
        this._expt = options.expt;
        return this;
    }

    /*
        @function: createToken()
        @param: payload {alg, issuer, audience, expt} , key
        @return: token string
    */

    async sign(_privateKey: string) {
        this.setSignOption({
            issuer: this._issuer,
            audience: this._audience,
            accessKey: randomKey(32)
        })
        let signedAccessKey = this.signAccessKey(_privateKey)
        let jwkPrivateKey:any = await jose.importJWK(getPrivateJWK(_privateKey), 'ES256K')
        return await new jose.SignJWT({accessKey: signedAccessKey})
        .setProtectedHeader({ alg: 'ES256K' })
        .setIssuedAt()
        .setNotBefore(Math.floor(Date.now() / 1000))
        .setIssuer(this._issuer)
        .setAudience(this._audience)
        .setExpirationTime(this._expt || '24h')
        .sign(jwkPrivateKey)
    }

    /*
        @function: verifyAccessHeader()
        @param: token , key
        @return: { payload, protectedHeader }
    */
    async verifyAccess(jwt: string, accessKey: any, _publicKey: any) {
        try {
            let jwkPublicKey: any = await jose.importJWK(_publicKey, 'ES256K')
            let  { payload } = await jose.jwtVerify(jwt, jwkPublicKey)
            let msgHash = sha3.keccak256(stringToBytes(JSON.stringify(
                {
                    issuer: payload.iss,
                    audience: payload.aud,
                    accessKey: accessKey
                }
            )));

            let sig: any = payload.accessKey
            let status = this.verifyAccessKey(msgHash, sig.signature)
            return {payload, status}
        } catch (error) {
            return error
        } 
    }

}
