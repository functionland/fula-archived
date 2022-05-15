import jose from "jose"

/*
    Generate Signature per content
    FulaSign is utility for creating Signature per content 
*/

class FulaSign {
    private _payload: Uint8Array

    constructor(payload: Uint8Array) {
        if (!(payload instanceof Uint8Array)) {
          throw new TypeError('payload must be Uint8Array')
        }
        this._payload = payload
    }

    async sign(privateKey: any) {
        return await new jose.CompactSign(
            this._payload
          )
            .setProtectedHeader({ alg: 'ES256' })
            .sign(privateKey)
    }

    async verify(publicKey: any) {
        return await jose.compactVerify(this._payload, publicKey)
    }
}


export class AccessToken extends FulaSign {
    
}