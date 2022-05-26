import * as jose from 'jose'
import { ProduceSign } from './sign'
import {getPublicJWK, getPrivateJWK} from './elliptic.key'



export class ProtectedAccessHeader extends ProduceSign {
    protected _payload: any
    private _issuer!:string
    private _audience!: string
    private _expt!: string

    /*
        @function: createToken()
        @param: payload {alg, issuer, audience, expt} , key
        @return: token string
    */
    async createToken(_privateKey:string) {
        let jwkPrivateKey:any = await jose.importJWK(getPrivateJWK(_privateKey), 'ES256K')      
        return await new jose.SignJWT(this._payload)
        .setProtectedHeader({ alg: 'ES256K' })
        .setIssuedAt()
        .setNotBefore(Math.floor(Date.now() / 1000))
        .setIssuer(this._issuer)
        .setAudience(this._audience)
        .setExpirationTime(this._expt)
        .sign(jwkPrivateKey)
    }

    /*
        @function: verifyToken()
        @param: token , key
        @return: { payload, protectedHeader }
    */
    async verifyToken(accessKey: any, _publicKey:string) {
        let jwkPublicKey: any = await jose.importJWK(getPublicJWK(_publicKey), 'ES256K')
        return  await jose.jwtVerify(accessKey, jwkPublicKey, {
            issuer: this._issuer,
            audience: this._audience
        })
    }

}
