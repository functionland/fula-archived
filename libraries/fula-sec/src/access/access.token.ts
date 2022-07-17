import * as jose from 'jose'
import isObjects from '../utils/isObject'
import splitKey from 'shamirs-secret-sharing'
import { JWTPayload } from 'did-jwt'

interface IAccessHeader {
    CID?: string
    issuer:string
    audience: string
    expt?: string | undefined
}

interface AccessHeaderResult {
    accessToken: string,
    sideKeys: Array<string>
}

export class ProtectedAccessHeader {
    private _issuer!: string
    private _audience!: string
    private _expt?: string | undefined
    protected _CID?: string

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

   protected _splitKey(prime: Uint8Array) {
        let _splitKey: Array<string> = []
        const shares = splitKey.split(Buffer.from(prime), { shares: 2, threshold: 2 })
        shares.forEach((element: Buffer) => {
            _splitKey.push(element.toString('hex'))
        });
        return _splitKey
    }     

    protected async sideKeySplit() {
        const sideKey = await jose.generateSecret('HS256')
        const sideJwk = await jose.exportJWK(sideKey)
        let splitKey = this._splitKey(new Uint8Array(Buffer.from(sideJwk.k as string)))
        return {
            sideKey,
            splitKey
        }
    }


    protected async sideKeyRecover(keys: Array<string>) {
         return await jose.importJWK({kty: 'oct', k: splitKey.combine(keys).toString()}, 'HS256')
    }

    /*
        @function: createAccess()
        @return: AccessHeaderResult{ accessToken, sideKeys }
    */
    async createAccess(): Promise<AccessHeaderResult> {
         let jsonKeyStore = await this.sideKeySplit()
         let accessToken = await new jose.EncryptJWT({CID: this._CID})
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
    }

    /*
        @function: verifyAccess()
        @param: accessToken , sideKeys
        @return: JWTPayload{ payload, protectedHeader }
    */
    async verifyAccess(accessToken: string, sideKeys: Array<string>): Promise<JWTPayload> {
        let sideJwk =  await this.sideKeyRecover(sideKeys)
        let  {payload}  = await jose.jwtDecrypt(accessToken, sideJwk, {
            issuer: this._issuer,
            audience: this._audience
        })
        return payload
    }

}
