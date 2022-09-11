import { derivePath, getMasterKeyFromSeed, getPublicKey } from '../../src/did/hkey/key.js';
import {getDidFromParentKey} from '../../src/did/utils/index.js'
import bip39 from 'bip39';
import { generateKeyPairFromSeed } from '@stablelib/x25519'

(async()=> {
    const mnemonic = bip39.generateMnemonic()
    console.log('mnemonic: ', mnemonic)

    let hexSeed = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
    console.log('seed: ', hexSeed)

    const master = getMasterKeyFromSeed(hexSeed);
    console.log('master key: ', master.key.toString('hex'))
    console.log('master chain', master.chainCode.toString('hex'));

    let pubkey = generateKeyPairFromSeed(master.key.slice(0, 32));

let parentDID = await getDidFromParentKey(master.key.slice(0, 32))
    console.log('ParentDID: ', parentDID)

    const sub = derivePath("m/0'/1/'", hexSeed);

    let subDID = await getDidFromParentKey(sub.key.slice(0, 32))
    console.log('subDID: ', subDID)
})()    