import * as UCAN from "@ipld/dag-ucan"
import * as uDID from "@ipld/dag-ucan/src/did.js"
import { HDKEY, DID } from "../../src/index.js"
import { base58btc } from "multiformats/bases/base58"
import * as u8a from 'uint8arrays';
import * as ucans from "../../src/did/hkey/utils/ts-ucan.cjs"

( async () => {
    const hexSeed = '9d7020006cf0696334ead54fffb859a8253e5a44860c211d23c7b6bf842d0c63535a5efd266a647cabdc4392df9a4ce28db7dc393318068d93bf33a32adb81ae';
    const ed = new HDKEY(hexSeed)
    const alice = ed.createEDKey()
    console.log('alice`s keyPair: ', alice)


    const aliceDID = new DID(ed._secretKey.slice(0, 32), alice.publicKey);
    const did = await aliceDID.getDID();
    console.log('did: ', did)
    const ucan = await UCAN.issue({
        issuer: alice,
        audience: alice,
        expiration: 1652449729,
        capabilities: [
          {
            with: alice.did(),
            can: "store/put",
          },
        ],
      });
    
    console.log('ucan: ', ucan)

    const root = await UCAN.issue({
      issuer: alice,
      audience: alice,
      capabilities: [
        {
          with: alice.did(),
          can: "store/put",
        },
      ],
    })

    console.log('root: ', root)

    const proof = await UCAN.link(root)
    console.log('proof: ', proof)

    const leaf = await UCAN.issue({
      issuer: alice,
      audience: alice,
      capabilities: root.capabilities,
      expiration: root.expiration,
      proofs: [proof],
    })

    console.log('leaf: ', leaf)
})();
