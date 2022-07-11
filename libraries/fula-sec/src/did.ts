import { DID } from 'dids'
import KeyResolver from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import sha3 from 'js-sha3'
import {Buffer} from 'buffer';
import { TaggedEncryption, ITagEncryption } from './tagged.enc';
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

export class FulaDID extends TaggedEncryption{
    private privateKey!: string;
    private authDID!: string;
    /**
     * This private function only class functions can use it
     * @function didProvider()
     * @property privateKey
     * @returns  authDID
     */
    private didProvider () {
        const _seed = Buffer.from(this.privateKey, 'hex');
        const provider = new Ed25519Provider(_seed);
        const did = new DID({ provider, resolver: KeyResolver.getResolver() });
        this.dIdentity(did)
        return did
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
        const did = this.didProvider();
        this.authDID = await did.authenticate();
        console.log('this.authDID: ', this.authDID)  
        return {
            authDID: this.authDID,
            privateKey: '0x' + this.privateKey
        }
    }
}