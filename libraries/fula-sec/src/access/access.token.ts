import * as jose from 'jose'
import { ProduceAccessKey } from './sign'
import isObjects from '../utils/isObject'
import { randomKey } from '../utils/u8a.multifoamats'
import { getPrivateJWK} from './elliptic.key'
import splitKey from 'shamirs-secret-sharing'
interface IAccessHeader {
    CID: string
    issuer:string
    audience: string
    expt?: string | undefined
}

export class ProtectedAccessHeader extends ProduceAccessKey {
    private _issuer!: string
    private _audience!: string
    private _expt?: string | undefined
    protected _CID!: string

    setDeclaration(options: IAccessHeader) {
        if (!isObjects(options)) {
            throw new TypeError('Set MUST be an object')
        }
        this._CID = options.CID;
        this._issuer = options.issuer;
        this._audience = options.audience;
        this._expt = options.expt;
        return this;
    }

    /*
        @function: sign()
        @param: payload {alg, issuer, audience, expt} , key
        @return: token string
    */

   splitKey(prime: Uint8Array) {
        let _splitKey: any = []
        const shares = splitKey.split(Buffer.from(prime), { shares: 2, threshold: 2 })
        shares.forEach((element: any) => {
            _splitKey.push(element.toString('hex'))
        });
        return {
            prime,
            splitKey: _splitKey
        }
   }     


    async sign(_privateKey: string) {
        let splitKey = this.splitKey(randomKey(32))
        let signedAccessKey = this.setSignOption({
            issuer: this._issuer,
            audience: this._audience,
            base: splitKey.splitKey[0]
        }).signAccessKey(_privateKey)
        let jwkPrivateKey:any = await jose.importJWK(getPrivateJWK(_privateKey), 'ES256K')
        return await new jose.SignJWT({signedAccessKey})
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
    async verifyAccess(jwt: string, rootHash: any, _publicKey: any) {
        try {
            let jwkPublicKey: any = await jose.importJWK(_publicKey, 'ES256K')
            let  { payload } = await jose.jwtVerify(jwt, jwkPublicKey)
            let status = this.verifyAccessKey(rootHash, payload.signedAccessKey)
            return { payload, status }
        } catch (error) {
            return error
        } 
    }

}