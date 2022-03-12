// test tagged.enc.ts
import { expect, should } from 'chai';
import { FullaDID } from "../src/did";
import {TaggedEncryption} from "../src/tagged.enc"

describe('DID', () => {
    it('1- Create random DID', async () => {
        const AfullaDID = new FullaDID();
        await AfullaDID.create();
        const Atagged = new TaggedEncryption(AfullaDID.did);

        const BfullaDID = new FullaDID();
        await BfullaDID.create();
        const Btagged = new TaggedEncryption(BfullaDID.did);

        let jwe = await Atagged.encrypt('aaaaaaa', 'bbbbbb', BfullaDID.authDID)
        console.log('jwe: ', jwe)

        let dec = await Btagged.decrypt(jwe)
        console.log('dec: ', dec)
        should().not.Throw
        // should().exist(result)
        // result.should.be.an('object');
    });
  });