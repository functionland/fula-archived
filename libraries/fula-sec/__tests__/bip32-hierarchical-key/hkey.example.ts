import { derivePath, getMasterKeyFromSeed, getPublicKey } from '../../src/did/hkey/key.js';
import { DID } from '../../src/did/did.js'
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

    let keyPair = generateKeyPairFromSeed(master.key.slice(0, 32));

    const idid = new DID(master.key.slice(0, 32), keyPair.publicKey);
    const {did} = await idid.getDID();
    console.log('ParentDID: ', did)

    const sub = derivePath("m/0'/1/'", hexSeed);

    let subDID = await idid.getDID(sub.key.slice(0, 32))
    console.log('subDID: ', subDID)
})()    