import * as UCAN from "@ipld/dag-ucan"
import * as uDID from "@ipld/dag-ucan/src/did.js"
import { HDKEY, DID } from "../../src/index.js"
import { base58btc } from "multiformats/bases/base58"
import * as u8a from 'uint8arrays';



( async () => {
    const hexSeed = '9d7020006cf0696334ead54fffb859a8253e5a44860c211d23c7b6bf842d0c63535a5efd266a647cabdc4392df9a4ce28db7dc393318068d93bf33a32adb81ae';
    const ed = new HDKEY(hexSeed)
    const master = ed.createEDKey()
    console.log('master key: ', master)

    const alice = new DID(master.secretKey.slice(0, 32), master.publicKey);
    const did = await alice.getDID();
    uDID.DID.parce()
    const DID_KEY_PREFIX = `did:key:`
    // const ucan = await UCAN.issue({
    //     issuer: `${DID_KEY_PREFIX}${u8a.toString(master.publicKey, 'base58btc')}`,
    //     audience: `${DID_KEY_PREFIX}${u8a.toString(master.publicKey, 'base58btc')}`,
    //     capabilities: [
    //       {
    //         with: did.did,
    //         can: "store/put",
    //       },
    //     ],
    // })
})();
