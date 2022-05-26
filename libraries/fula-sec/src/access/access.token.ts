import * as jose from 'jose'
import { ProduceSign } from './sign'
import isObjects from '../utils/isObject'
import { stringToBytes } from '../utils/u8a.multifoamats'
import {getPublicJWK, getPrivateJWK} from './elliptic.key'


interface IAccessHeader {
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
        this._payload = options;
        this._issuer = options.issuer;
        this._audience = options.audience;
        this._expt = options.expt;
    }

    /*
        @function: createToken()
        @param: payload {alg, issuer, audience, expt} , key
        @return: token string
    */
    async createToken(_privateKey: string) {
        let jwkPrivateKey:any = await jose.importJWK(getPrivateJWK(_privateKey), 'ES256K')      
        return await new jose.SignJWT(this._payload)
        .setProtectedHeader({ alg: 'ES256K' })
        .setIssuedAt()
        .setNotBefore(Math.floor(Date.now() / 1000))
        .setIssuer(this._issuer)
        .setAudience(this._audience)
        .setExpirationTime(this._expt || '24h')
        .sign(jwkPrivateKey)
    }

    /*
        @function: verifyToken()
        @param: token , key
        @return: { payload, protectedHeader }
    */
    async verifyToken(accessKey: string, _publicKey:string) {
        let jwkPublicKey: any = await jose.importJWK(getPublicJWK(_publicKey), 'ES256K')
        return  await jose.jwtVerify(accessKey, jwkPublicKey, this._payload)
    }

}
