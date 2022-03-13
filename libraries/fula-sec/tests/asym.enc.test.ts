// test tagged.enc.ts
import { expect, should } from 'chai';
import { FullaDID } from "../src/did";
import { AsymEncryption } from "../src/asym.enc"

describe('Asymetric Encription', () => {

    it('1- Issuer encryptes string with pubKey and decrypts with priKey', async () => {
        const fullaDID = new FullaDID();
        await fullaDID.create();
        
        const asymEnc = new AsymEncryption(fullaDID.privateKey);
        let plaintext = {
            symetricKey: '12345',
            CID: 'aaaaaaaaaaaaaaa'
        }
        let jwe = await asymEnc.encrypt(plaintext.symetricKey, plaintext.CID, asymEnc.publicKey);
        let ciphertext = await asymEnc.decrypt(jwe);

        should().not.Throw
        expect(JSON.stringify(plaintext)).to.equal(JSON.stringify(ciphertext));
    });

    it('2- Issuer encryptes string with pubKey and Audience decrypts with priKey', async () => {
        // Issuer
        const I_fullaDID = new FullaDID();
        await I_fullaDID.create();
        const I_asymEnc = new AsymEncryption(I_fullaDID.privateKey);
        
        // Audience
        const A_fullaDID = new FullaDID();
        await A_fullaDID.create();
        const A_asymEnc = new AsymEncryption(A_fullaDID.privateKey);
        
        let plaintext = {
            symetricKey: 'content-privateKey',
            CID: 'Content ID'
        }
        
        // Issuer encrypts plaintext with Audience PublicKey
        let jweCipher = await I_asymEnc.encrypt(plaintext.symetricKey, plaintext.CID, A_asymEnc.publicKey);

        // Audience decrypts with private Key
        let decrypted = await A_asymEnc.decrypt(jweCipher);

        should().not.Throw
        expect(JSON.stringify(plaintext)).to.equal(JSON.stringify(decrypted));
    });


    it('3- Unknown audience attempting to decrypt with own priKey', async () => {
        // Issuer
        const I_fullaDID = new FullaDID();
        await I_fullaDID.create();
        const I_asymEnc = new AsymEncryption(I_fullaDID.privateKey);
        
        // Known Audience
        const A_fullaDID = new FullaDID();
        await A_fullaDID.create();
        const A_asymEnc = new AsymEncryption(A_fullaDID.privateKey);

        // Unkown Audience
        const UN_fullaDID = new FullaDID();
        await UN_fullaDID.create();
        const UN_asymEnc = new AsymEncryption(UN_fullaDID.privateKey);
        
        let plaintext = {
            symetricKey: 'content-privateKey',
            CID: 'Content ID'
        }
        
        // Issuer encrypts plaintext with Known Audience PublicKey
        let jweCipher = await I_asymEnc.encrypt(plaintext.symetricKey, plaintext.CID, A_asymEnc.publicKey);

        // Unkown Audience Attepting to Decrypts onw Private Key but gets error
        UN_asymEnc.decrypt(jweCipher).catch(err => {
            err.should().Throw
            should().exist(err)
        })
    });
  });