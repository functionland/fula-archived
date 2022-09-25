import { HDKEY } from '../../src/did/hkey/key.js';
import { DID } from '../../src/did/did.js'
import { generateKeyPairFromSeed, extractPublicKeyFromSecretKey } from '@stablelib/ed25519'

(async()=> {
    let hexSeed = '9d7020006cf0696334ead54fffb859a8253e5a44860c211d23c7b6bf842d0c63535a5efd266a647cabdc4392df9a4ce28db7dc393318068d93bf33a32adb81ae';
    const ed = new HDKEY(hexSeed)
    const master = ed.createEDKey()
    console.log('master key: ', master)
    fetch('/users').then(res => res.json())
    const idid = new DID(ed._secretKey.slice(0, 32), master.publicKey);
    const did = await idid.getDID();
    console.log('ParentDID: ', did)

    const sub = ed.deriveKeyPath("m/0'/0'");
    console.log('child Key: ', sub)
    let subDID = await idid.getDID(ed._secretKey.slice(0, 32))
    console.log('subDID: ', subDID)
})()    