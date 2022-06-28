// test tagged.enc.ts
import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"

describe('Tagged Encription', () => {
    // it('1- Add DID address to encrypt', async () => {
    //     const AfulaDID = new FulaDID();
    //     await AfulaDID.create();
    //     const Atagged = new TaggedEncryption(AfulaDID.did);

    //     const BfulaDID = new FulaDID();
    //     await BfulaDID.create();
    //     const Btagged = new TaggedEncryption(BfulaDID.did);

    //     let plaintext = {
    //         symetricKey: '12345',
    //         CID: 'aaaaaaaaaaaaaaa'
    //     }
    //     let jwe = await Atagged.encrypt(plaintext.symetricKey, plaintext.CID, [BfulaDID.did.id])
    //     console.log('jwe: ', jwe.recipients)
    //     let dec = await Btagged.decrypt(jwe)
    //     should().not.Throw
    //     expect(JSON.stringify({symetricKey: dec.symetricKey, CID: dec.CID})).to.equal(JSON.stringify(plaintext))
    // });

  });
