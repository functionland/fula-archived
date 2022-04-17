import { DID } from 'dids'
// import {generateMnemonic} from 'bip39'
import {ethers, utils } from 'ethers'
import KeyResolver from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
/**
 * @class FullaDID
 * @description Creates Decentrilized Identity for Clinet side application 
 * based on Ed25519 Private Key - Edwards-curve Digital Signature Algorithm(EdDSA)
 */

interface IFullaDID {
    privateKey: string;
    mnemonic: string;
    authDID: string;
    did: any;
}

export class FullaDID implements IFullaDID {
    privateKey!: any
    mnemonic!: string;
    authDID!: string;
    did: any;
    /**
     * This private function only class functions can use it
     * @function didProvider()
     * @property privateKey
     * @returns  authDID
     */
    private async didProvider () {
        // const seed = new Uint8Array(32) //  32 bytes with high entropy
        // const provider = new Ed25519Provider(seed)
        // this.did = new DID({ provider, resolver: KeyResolver.getResolver() })
        // // console.log('this.did: ', this.did)
        // await this.did.authenticate();
        // console.log('this.did: ', this.did)
    }
    /**
     * Creates mnemocic phrase and private key
     * @function create()
	 * @returns Object - {authDID, privateKey, mnemonic}
	 */
    async create () {
        const seed = new Uint8Array(32) //  32 bytes with high entropy
        const provider = new Ed25519Provider(seed)
     
        const did = new DID({ provider, resolver: KeyResolver.getResolver() })
        console.log('did: ', did)
        await did.authenticate();

        console.log('did-id', did.id);
        return {
            // mnemonic: this.mnemonic,
            // privateKey: this.privateKey,
            authDID: did.id
        }
        // const wallet = ethers.Wallet.createRandom()
        // this.mnemonic = wallet.mnemonic.phrase
        // this.privateKey = wallet.privateKey
        // await this.didProvider();
        // console.log('this.authDID: ', this.did.id)
        // return {
        //     // mnemonic: this.mnemonic,
        //     privateKey: this.privateKey,
        //     authDID: this.authDID
        // }
    }
    /**
     * Backup option
     * @function backup() - getter
	 * @returns Object - {authDID, privateKey, mnemonic}
	 */
    get backup() {
        return {
            mnemonic: this.mnemonic,
            privateKey: this.privateKey,
            authDID: this.authDID
        }
    }
    /**
     * Improt mnemonic phrases (12 random words)
     * @function importMnemonic()
     * @param mnemonic: string
	 * @returns Object - {authDID, privateKey}
	 */
    async importMnemonic (mnemonic: string) {
        const hdwallet = utils.HDNode.fromMnemonic(mnemonic);
        this.privateKey = hdwallet.derivePath(`m/44'/60'/0'/0/0`) //.getPrivateKey().toString('hex')
       await this.didProvider();
        return {
            privateKey: this.privateKey,
            authDID: this.authDID
        }
    }
    /**
     * Improt existing privateKey
     * @function importPrivateKey()
     * @param privateKey: string
	 * @returns Object - {authDID, privateKey}
	 */
    async importPrivateKey (privateKey: string) {
        this.privateKey = privateKey;
        await this.didProvider();
        return {
            privateKey: this.privateKey,
            authDID: this.authDID
        }
    }
}