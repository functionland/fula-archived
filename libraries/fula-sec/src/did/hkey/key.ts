import createHmac from 'create-hmac'
import { extractPublicKeyFromSecretKey } from '@stablelib/ed25519'
import { replaceDerive, pathRegex } from './utils/utils.js';

type Hex = string;
type Path = string;

type Keys = {
    key: Buffer;
    chainCode: Buffer;
};

export type EdKeyType = {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
    keyType: 'ed25519';
}

const ED25519_CURVE = 'ed25519 seed';
const HARDENED_OFFSET = 0x80000000;

export class HDKEY {
    private _seed: Hex;
    private _Key!: Keys;
    private _secretKey!: Uint8Array;
    constructor(seed: Hex) {
        this._seed = seed;
    }

    createEDKey(seed?: Hex): EdKeyType {
        const hmac = createHmac('sha512', ED25519_CURVE);
        const secretKey = hmac.update(Buffer.from(seed || this._seed, 'hex')).digest();
        const IL = secretKey.slice(0, 32);
        const IR = secretKey.slice(32);
        const key = IL;
        const chainCode = IR;
        this._Key = {
            key,
            chainCode
        }
        this._secretKey = new Uint8Array(secretKey)
        return {
            publicKey: this.getPublicKey(this._secretKey),
            secretKey: this._secretKey,
            keyType: 'ed25519' 
        }
    };

    getPublicKey(secretKey?: Uint8Array): Uint8Array {
       return extractPublicKeyFromSecretKey(secretKey || this._secretKey)
    }

    private _extendPrivateKey({ key, chainCode }: Keys, index: number): Keys {
        const indexBuffer = Buffer.allocUnsafe(4);
        indexBuffer.writeUInt32BE(index, 0);
    
        const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);
    
        const I = createHmac('sha512', chainCode)
            .update(data)
            .digest();
        const IL = I.slice(0, 32);
        const IR = I.slice(32);
        return {
            key: IL,
            chainCode: IR,
        };
    };

    isValidPath(path: string): boolean {
        if (!pathRegex.test(path)) {
            return false;
        }
        return !path
            .split('/')
            .slice(1)
            .map(replaceDerive)
            .some(isNaN as any /* ts T_T*/);
    };

    private _deriveKeyPath(path: Path, offset = HARDENED_OFFSET): Keys {
        if (!this.isValidPath(path)) {
            throw new Error('Invalid derivation path');
        }
        
        const key = this._Key.key;
        const chainCode = this._Key.chainCode;

        const segments = path
            .split('/')
            .slice(1)
            .map(replaceDerive)
            .map(el => parseInt(el, 10));
    
        return segments.reduce(
            (parentKeys, segment) => this._extendPrivateKey(parentKeys, segment + offset),
            { key, chainCode }
        );
    };

    deriveKeyPath(path: Path, offset = HARDENED_OFFSET): EdKeyType {
        let { key, chainCode } = this._deriveKeyPath(path, offset);
        const privateKey =  new Uint8Array(Buffer.concat([key, chainCode]));
        return {
            publicKey: this.getPublicKey(privateKey),
            secretKey: privateKey,
            keyType: 'ed25519'
        }
    }
}

