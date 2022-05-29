import * as jose from 'jose'
import { ProduceSign } from './sign'
import isObjects from '../utils/isObject'
import { stringToBytes, bytesToString } from '../utils/u8a.multifoamats'
import {getPublicJWK, getPrivateJWK, getPublicJWKfromPrivateKey} from './elliptic.key'
import { bytes } from 'multiformats'

interface IAccessHeaderPayload {
    jwe: any,
    CID: string,
}

interface IAccessHeader {
    payload: IAccessHeaderPayload
    issuer:string
    audience: string
    expt?: string | undefined
}

export class ProtectedAccessHeader extends ProduceSign {
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
    async signer(_privateKey: string) {
        let jwkPrivateKey:any = await jose.importJWK(getPrivateJWK(_privateKey), 'ES256K')
        this.setSignOption({
            jwe: this._payload.jwe,
            CID: this._payload.CID,
            issuer: this._issuer,
            audience: this._audience
        })
        let signature = await this.signKey(jwkPrivateKey)
        return await new jose.SignJWT({signature})
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
    async verifyAccessKey(accessKey: string, _publicKey: any) {
        try {
            let jwkPublicKey: any = await jose.importJWK(_publicKey, 'ES256K')
            let verify: any = await jose.jwtVerify(accessKey, jwkPublicKey, this._payload)
            let status:any = await this.verifySign(verify.payload.signature, jwkPublicKey)
            return {verify, status: bytesToString(status.payload)}  
        } catch (error) {
            return error
        } 
    }

}
