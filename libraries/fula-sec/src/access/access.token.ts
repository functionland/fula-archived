import * as jose from 'jose'
import { ProduceAccessKey } from './sign'
import isObjects from '../utils/isObject'
import { stringHexToU8a } from '../utils/u8a.multifoamats'
import { getPrivateJWK} from './elliptic.key'
import splitKey from 'shamirs-secret-sharing'
import { buffer } from 'stream/consumers'
import { type } from 'os'
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

   protected _splitKey(prime: Uint8Array) {
        let _splitKey: Array<string> = []
        const shares = splitKey.split(Buffer.from(prime), { shares: 2, threshold: 2 })
        shares.forEach((element: any) => {
            _splitKey.push(element.toString('hex'))
        });
        return _splitKey
    }     

    protected async sideKeySplit() {
        const sideKey = await jose.generateSecret('HS256')
        const sideJwk = await jose.exportJWK(sideKey)
        console.log('sideJwk>', sideJwk)
        let splitKey = this._splitKey(new Uint8Array(Buffer.from(sideJwk.k as string)))
        return {
            sideKey,
            splitKey
        }
    }


    protected async sideKeyRecover(keys: Array<string>) {
        return await jose.importJWK({kty: 'oct', k: splitKey.combine(keys)})
    }

    async createAccess(CID: string) {
       try {
         let jsonKeyStore = await this.sideKeySplit()
         let accessToken = await new jose.EncryptJWT({CID})
             .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
             .setIssuedAt()
             .setNotBefore(Math.floor(Date.now() / 1000))
             .setIssuer(this._issuer)
             .setAudience(this._audience)
             .setExpirationTime(this._expt || '24h')
             .encrypt(jsonKeyStore.sideKey)
         return {
             accessToken,
             sideKeys: jsonKeyStore.splitKey 
         }
       } catch (error) {
            return error
       }
    }

    /*
        @function: verifyAccessHeader()
        @param: token , key
        @return: { payload, protectedHeader }
    */
    async verifyAccess(accessToken: string, sideKeys: Array<string>) {
        try {
            let sideJwk =  await this.sideKeyRecover(sideKeys)
            let  { payload } = await jose.jwtDecrypt(accessToken, sideJwk)
            return { payload }
        } catch (error) {
            return error
        } 
    }

}
