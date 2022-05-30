import { ec as EC } from 'elliptic'
import isObjects from '../utils/isObject'
import { stringToBytes } from '../utils/u8a.multifoamats'
import sha3 from 'js-sha3'
/*
    Generate Signature per content
    FulaSign is utility for creating Signature per content 
*/
interface ISigPayLoad {
    issuer: string,
    audience: string,
    accessKey: any
}

export class ProduceAccessKey {
    protected _msgHash!: string

    setSignOption(options: ISigPayLoad) {
        if (!isObjects(options)) {
            throw new TypeError('options must be an object')
        }
        this._msgHash = sha3.keccak256(stringToBytes(JSON.stringify(options)));
    }

    signAccessKey(privateKey: any) {
        const secp256k1 = new EC('secp256k1')
        let signature = secp256k1.sign(this._msgHash, privateKey, "hex", {canonical: true});
        return {
            signature,
            msgHash: this._msgHash
        }
    }

    verifyAccessKey(msgHash: string, signature: any) {
        console.log('signature: ', signature)
        const secp256k1 = new EC('secp256k1')
        let hexToDecimal = (x:any) => secp256k1.keyFromPrivate(x, "hex").getPrivate().toString(10);
        let pubKeyRecovered = secp256k1.recoverPubKey(
        hexToDecimal(msgHash), signature, signature.recoveryParam, "hex");
        console.log("Recovered pubKey:", pubKeyRecovered.encodeCompressed("hex"));

        let validSig = secp256k1.verify(msgHash, signature, pubKeyRecovered);
        console.log("Signature valid?", validSig);
        return validSig
    }
}