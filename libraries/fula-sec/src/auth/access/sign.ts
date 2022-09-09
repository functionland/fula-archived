import secp256k1 from 'secp256k1';
import isObjects from '../../utils/isObject'
import { stringToBytes, bytesToBase64, base64ToBytes, stringHexToU8a } from '../../utils/u8a.multifoamats'
import sha3 from 'js-sha3'
/*
    Generate Signature per content
    FulaSign is utility for creating Signature per content 
*/
interface ISigPayLoad {
    issuer: string,
    audience: string,
    base: any
}

export class ProduceAccessKey {
    protected _rootHash!: string

    protected setSignOption(options: ISigPayLoad) {
        if (!isObjects(options)) {
            throw new TypeError('options must be an object')
        }
        this._rootHash = sha3.keccak256(stringToBytes(JSON.stringify(options)));
        return this
    }

    protected signAccessKey(privateKey: any) {
        let _signedKey = secp256k1.ecdsaSign(Buffer.from(this._rootHash, 'hex'), stringHexToU8a(privateKey.slice(2)));
        let signedKey = bytesToBase64(_signedKey.signature)    
        return {
            signature: signedKey,
            recid: _signedKey.recid,
            rootHash: this._rootHash
        }
    }

    protected verifyAccessKey(rootHash: string, signedAccessKey: any) {
        console.log('signedAccessKey: ', signedAccessKey)
        let pubKey = secp256k1.ecdsaRecover(base64ToBytes(signedAccessKey.signature), signedAccessKey.recid, Buffer.from(signedAccessKey.rootHash, 'hex'))
        let validSig =  secp256k1.ecdsaVerify(base64ToBytes(signedAccessKey.signature), Buffer.from(rootHash, 'hex'), pubKey)
        return {
            whoIs: Buffer.from(pubKey).toString('hex'),
            isValid: validSig
        }
    }
}