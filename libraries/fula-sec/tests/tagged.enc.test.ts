// test tagged.enc.ts
import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"

describe('Tagged Encription', () => {
    it('1- Add DID address to encrypt', async () => {
        const AfulaDID = new FulaDID();
        await AfulaDID.create('alice-secret-12345', '76ddae0f3a25b92268175400149d65d6887b9cefaf28ea2c078e05cdc15a3c0a');
        const Atagged = new TaggedEncryption(AfulaDID.did);
        
        
        // -=-=-=-
        const BfulaDID = new FulaDID();
        await BfulaDID.create('bob-secret-355612', '37ddae0f3a25b92268175400149d65d6887b9cefaf28ea2c078e05cdc15a3c0a');
        const Btagged = new TaggedEncryption(BfulaDID.did);




        let plaintext = {
            symetricKey: '4646548746',
            CID: 'aaaaaaaaaaaaaaa'
        }
        let jwe = await Atagged.encrypt(plaintext.symetricKey, plaintext.CID, [BfulaDID.did.id, AfulaDID.did.id])
        console.log('jwe: ', jwe)

        
        //-=-=-=-=-
        let dec = await Btagged.decrypt(jwe)
        console.log('dec: ', dec)
        should().not.Throw
        expect(JSON.stringify({symetricKey: dec.symetricKey, CID: dec.CID})).to.equal(JSON.stringify(plaintext))
    });

  });
