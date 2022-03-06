import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import {generateMnemonic} from 'bip39'
import HDWallet from 'ethereum-hdwallet'
import { DID } from 'dids'
import KeyResolver from 'key-did-resolver'

/**
 * @class FullaDID
 */
export class FullaDID {
    privateKey: string;
    mnemonic: string;
    authDID: string;


    constructor() {
        this.privateKey = '';
        this.mnemonic = '';
        this.authDID = '';
    }
    
    private async didProvider () {
        let provider = new Ed25519Provider(Buffer.from(this.privateKey, 'hex'))
        let did = new DID({ provider, resolver: KeyResolver.getResolver()})
        return await did.authenticate();
         
    }
    /**
	 * @param {*} mnemonic
	 * @returns
	 * @memberof FullaDID
	 */
    async create () {
        this.mnemonic = generateMnemonic()
        let hdwallet = HDWallet.fromMnemonic(this.mnemonic)
        this.privateKey = hdwallet.derive(`m/44'/60'/0'/0/0`).getPrivateKey().toString('hex')
        this.authDID = await this.didProvider();
        return {
            mnemonic: this.mnemonic,
            privateKey: this.privateKey,
            authDID: this.authDID
        }
    }

    get backup() {
        return {
            mnemonic: this.mnemonic,
            privateKey: this.privateKey,
            authDID: this.authDID
        }
    }

    async importMnemonic (mnemonic: string) {
        let hdwallet = HDWallet.fromMnemonic(mnemonic);
        this.privateKey = hdwallet.derive(`m/44'/60'/0'/0/0`).getPrivateKey().toString('hex')
        this.authDID = await this.didProvider();
        return {
            privateKey: this.privateKey,
            authDID: this.authDID
        }
    }

    async imposrtPrivateKey (privateKey: string) {
        this.privateKey = privateKey;
        this.authDID = await this.didProvider();
        return {
            privateKey: this.privateKey,
            authDID: this.authDID
        }
    }
}