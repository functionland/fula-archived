// test tagged.enc.ts
import { expect, should } from 'chai';
import { FullaDID } from "../src/did";
import {TaggedEncryption} from "../src/tagged.enc"

describe('Tagged Encription', () => {
    it('1- Add DID address to encrypt', async () => {
        const AfullaDID = new FullaDID();
        await AfullaDID.create();
        const Atagged = new TaggedEncryption(AfullaDID.did);

        const BfullaDID = new FullaDID();
        await BfullaDID.create();
        const Btagged = new TaggedEncryption(BfullaDID.did);

        let plaintext = {
            symetricKey: '12345',
            CID: 'aaaaaaaaaaaaaaa'
        }
        let jwe = await Atagged.encrypt(plaintext.symetricKey, plaintext.CID, BfullaDID.authDID)
        console.log('jwe: ', jwe)

        let dec = await Btagged.decrypt(jwe)
        should().not.Throw
        expect(JSON.stringify({symetricKey: dec.symetricKey, CID: dec.CID})).to.equal(JSON.stringify(plaintext))
    });

  });