import * as jose from 'jose'
/*
    Generate Signature per content
    FulaSign is utility for creating Signature per content 
*/

interface ISign {
    payload: Uint8Array
    alg?: string
    jws: string | Uint8Array
}

class Sign {
    _payload: Uint8Array
    _alg?:string 
    _jws: string | Uint8Array 

    constructor(options: ISign) {
        if (!(options.payload instanceof Uint8Array)) {
          throw new TypeError('payload must be Uint8Array')
        }
        this._payload = options.payload;
        this._alg = options.alg;
        this._jws = options.jws;
    }

    async sign(privateKey: any) {
        return await new jose.CompactSign(
            this._payload
          )
            .setProtectedHeader({ alg: this._alg || 'ES256' })
            .sign(privateKey)
    }

    async verify(publicKey: any) {
        return await jose.compactVerify(this._jws, publicKey)
    }
}

interface IAccessToken extends ISign {
    payload: any
    issuer:string
    audience: string
    expt: number
    token: string,
    alg?: string 
}

export class AccessToken extends Sign {
    payload: any
    issuer:string
    audience: string
    expt: number
    token: string

    constructor(options: IAccessToken) {
        super(options);
        this.payload = options.payload;
        this.issuer = options.issuer;
        this.audience = options.audience;
        this.expt = options.expt
        this.token = options.token 
    }

    /*
        @function: createToken()
        @param: payload {alg, issuer, audience, expt} , key
        @return: token string
    */
    async createToken(jwkPrivateKey:any) {
        return await new jose.SignJWT(this.payload)
        .setProtectedHeader({ alg: this._alg || 'ES256' })
        .setIssuedAt()
        .setNotBefore(Math.floor(Date.now() / 1000))
        .setIssuer(this.issuer)
        .setAudience(this.audience)
        .setExpirationTime(this.expt)
        .sign(jwkPrivateKey)
    }

    /*
        @function: verifyToken()
        @param: token , key
        @return: { payload, protectedHeader }
    */
    async verifyToken(key:any) {
        return  await jose.jwtVerify(this.token, key, {
            issuer: this.issuer,
            audience: this.audience
        })
    }

}
