import { derivePath, getMasterKeyFromSeed, getPublicKey } from '../../src/did/hkey/key.js';
import {getDidFromParentKey} from '../../src/did/utils/index.js'
import bip39 from 'bip39';


(async()=> {

    const mnemonic = bip39.generateMnemonic()
    console.log('mnemonic: ', mnemonic)

    let hexSeed = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
    console.log('seed: ', hexSeed)

    const master = getMasterKeyFromSeed(hexSeed);
    console.log('master key: ', master.key.toString('hex'))
    console.log('master chain', master.chainCode.toString('hex'));

    let parentDID = await getDidFromParentKey(master.key)
    console.log('ParentDID: ', parentDID)

    const sub = derivePath("m/0'/1'", hexSeed);

    let subDID = await getDidFromParentKey(sub.key)
    console.log('subDID: ', subDID)
})()    