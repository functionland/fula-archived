import { expect, should } from 'chai';
import { DID } from '../../src/did/did';
import {HDKEY} from '../../src/did/hkey/key';

describe('Asymetric Encription', () => {
    it('1- Issuer encryptes string with pubKey and decrypts with priKey', async () => {

        let hexSeed = '9d7020006cf0696334ead54fffb859a8253e5a44860c211d23c7b6bf842d0c63535a5efd266a647cabdc4392df9a4ce28db7dc393318068d93bf33a32adb81ae';
        const ed = new HDKEY(hexSeed)
        const master = ed.createEDKey()
    
        const asymEnc = new DID(master.secretKey, master.publicKey);
        let plaintext = {
            symetricKey: '12345',
            CID: 'aaaaaaaaaaaaaaa'
        }

        let parentDID = await asymEnc.getDID(master.secretKey)
        console.log('ParentDID: ', parentDID)

        console.log('asymEnc.publicKey: ', asymEnc.publicKey)
        let jwe = await asymEnc.createJWE(plaintext, [asymEnc.publicKey]);
        console.log('JWE: ', jwe)
        let ciphertext = await asymEnc.decryptJWE(jwe)
        console.log('ciphertext: ', ciphertext)
        should().not.Throw
    });
});