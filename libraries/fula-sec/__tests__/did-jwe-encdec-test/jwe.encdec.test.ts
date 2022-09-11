import { expect, should } from 'chai';
import { DID } from '../../src/did/did';
import { getMasterKeyFromSeed, getPublicKey } from '../../src/did/hkey/key';
import bip39 from 'bip39';
import { generateKeyPairFromSeed } from '@stablelib/x25519'
import {bytesToBase58, base58ToBytes } from '../../src/utils/u8a.multifoamats'

describe('Asymetric Encription', () => {
    it('1- Issuer encryptes string with pubKey and decrypts with priKey', async () => {
        const mnemonic = bip39.generateMnemonic()
        console.log('mnemonic: ', mnemonic)

        // let hexSeed = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
        let hexSeed = 'simple squirrel mirror answer please often device decide demand bottom harvest range';
        console.log('seed: ', hexSeed)

        const master = getMasterKeyFromSeed(hexSeed);
        console.log('master key: ', master.key.toString('hex'));
        console.log('master chain', master.chainCode.toString('hex'));
        console.log('getPublicKey: ', getPublicKey(master.key.slice(0, 32)).toString('hex'))

        console.log('master key byte: ', new Uint8Array(master.key));
        console.log('master chain byte', new Uint8Array(master.chainCode));
        console.log('getPublicKey byte : ', new Uint8Array(getPublicKey(master.key.slice(0, 32)).slice(1)));
        // pub: 00e902d743d9caf1ce2f85541a050d2c95c5ecf5695fa0157701542059f546e890
        // priv:  75c63098d208959d6397d81ee8ec9ec141f45fe144c6facef24e27b590d059be
        let encode = bytesToBase58(master.key)
        let decode = base58ToBytes(encode)
        console.log('Encoder: ', encode)
        console.log('Decoder: ', decode)

        let pubkey = generateKeyPairFromSeed(master.key.slice(0, 32));
        console.log('pubkey for JWE TEST: ', pubkey);

        // const asymEnc = new DID(master.key, new Uint8Array(getPublicKey(master.key.slice(0, 32)).slice(1)));
        const asymEnc = new DID(pubkey.secretKey, pubkey.publicKey);
        let plaintext = {
            symetricKey: '12345',
            CID: 'aaaaaaaaaaaaaaa'
        }

        let parentDID = await asymEnc.getDID(master.key.slice(0, 32))
        console.log('ParentDID: ', parentDID)

        console.log('asymEnc.publicKey: ', asymEnc.publicKey)
        let jwe = await asymEnc.createJWE(plaintext, [asymEnc.publicKey]);
        console.log('JWE: ', jwe)
        let ciphertext = await asymEnc.decryptJWE(jwe)
        console.log('ciphertext: ', ciphertext)
        should().not.Throw
        // expect(JSON.stringify(plaintext)).to.equal(JSON.stringify(ciphertext));
    });
});