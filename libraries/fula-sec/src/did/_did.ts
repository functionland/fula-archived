import { DID, DIDProvider } from 'dids'
import KeyResolver from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import sha3 from 'js-sha3'
import {Buffer} from 'buffer';


/**
 * @class FullaDID
 * @description Creates Decentrilized Identity for Clinet side application
 * 
*/

export interface ActivateParam {
    secretKey?: string, 
    signature: string
}

export interface ActivateDIDResult {
    authDID: string, 
    privateKey: string
}

export class FulaDID {
    private privateKey!: string;
    private authDID!: string;
    did: any;
    /**
     * This private function only class functions can use it
     * @function didProvider()
     * @property privateKey
     * @returns  authDID
     */
    private _didProvider (): Promise<string> {
        const _seed = Buffer.from(this.privateKey, 'hex');
        const provider = new Ed25519Provider(_seed);
        this.did = new DID({ provider, resolver: KeyResolver.getResolver() });
        return this.did.authenticate();
    }
    /**
     * Activate decentralized identity
     * @function activate()
     * @property _secretKey: string, signature: string
	 * @returns Object - { authDID }
	 */
    async activate (object: ActivateParam): Promise<ActivateDIDResult> {
        // todo get wallet address and verift is wallet signed
        this.privateKey = sha3.keccak256(JSON.stringify({
            secretKey: object.secretKey || "" ,
            signature: object.signature
        }));
        this.authDID = await this._didProvider();  
        return {
            authDID: this.authDID,
            privateKey: '0x' + this.privateKey
        }
    }
}