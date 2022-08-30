// import { expect, should } from 'chai';
// import {FulaDID, TaggedEncryption} from "../src/index"
// import {ProtectedAccessHeader} from '../src/access/access.token'
// import {getPublicJWK, recoverPublicJWK} from '../src/access/elliptic.key'
//   // test tagged.enc.ts
//   import  { AsymEncryption }  from "../src/asym.enc"

// describe('Access Token and Encryt/Decrypt', () => {
//     it('1- ', async () => {
//         const fulaDID = new FulaDID();
                            
//         let result = await fulaDID.activate({
//             secretKey: 'vvvvvv',
//             signature: 'b3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
//         });
//         console.log('fulaDID: ', result)
    
//         let accessKey: any = await new ProtectedAccessHeader()
//         .setDeclaration({
//             issuer: result.authDID,
//             audience: result.authDID,
//             expt: '1h',
//             CID: 'Qmhb9440d648dfa4b35e067f39c18aae59c6e05f01af9b'
//         }).createAccess();

//         console.log('accessKey: ', accessKey);

//         const tagged = new TaggedEncryption(fulaDID.did);

//         let plaintext = {
//             symetricKey: '12345',
//             CID: 'aaaaaaaaaaaaaaa'
//         }
     
//         let jwe = await tagged.encrypt(plaintext.symetricKey, accessKey.sideKeys[0], [fulaDID.did.id])
//         let objJsonStr = JSON.stringify(jwe);
//         let jweB64 = Buffer.from(objJsonStr).toString("base64");
//         console.log('jweB64: ', jweB64)
        
//         let decrypted = await tagged.decrypt(jwe)
//         console.log('decrypted: ', decrypted)
//         should().not.Throw
//     });

//     it('2- ', async () => {
//         const fulaDID = new FulaDID();
                            
//         let result = await fulaDID.activate({
//             secretKey: 'vvvvvv',
//             signature: 'b3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
//         });
//         console.log('fulaDID: ', result)
    
//         const tagged = new TaggedEncryption(fulaDID.did);

//         let jweB64 = 'eyJwcm90ZWN0ZWQiOiJleUpsYm1NaU9pSllRekl3VUNKOSIsIml2IjoiV3JxQ2pLcFRRM3d6aXlKNE1NdjhNX20xdkJ0cy05a3ciLCJjaXBoZXJ0ZXh0IjoiejZLNnhNSXVoWTBKTXFLbkhVWGJNMUloTmtGMC1oS2RQM0tUMjVGSHRJbG54VEJFcjRyaXBQcXVpdHNUNlNFQzRScFdwd2tlSzlmdjBjejhtSTR3dFUwYm9WckR2akU0YkppcEpUSEVnTXJzZXVtbXRBb25LQktEMkc1RnVQR0c4QUdXRDZ4NWpoTVBoejNyYXhyWkQwVFRsS3FuSnBtY01CYko2UExjeXZnY2c4VlRNS2F5ckU2TkJUS041bklXdWJ6QWxMdlVENkRDZzNlWG5rSnpEWkE1YWlJM0ltWS02dHVSRFc3aF9kOUhaY3pvdDlCRmRha1lpZGd6MEwxQWFYb0dmN2xveEpySUVQSDVoUC1QZmw1d293c1NPUUk2QnlUMXYtb1JFMlZqRVVNZy0tNTI5MnRZd1ctQTJUUHciLCJ0YWciOiJ3d3pxQnBSUmhHWTBTMDVwRm1nR3RRIiwicmVjaXBpZW50cyI6W3siZW5jcnlwdGVkX2tleSI6IlJ4cXVUOXNYMXctbW5rTGJoRTNnNUd2WVlBSzI4cFI3ak53Rk84MkpHUGciLCJoZWFkZXIiOnsiYWxnIjoiRUNESC1FUytYQzIwUEtXIiwiaXYiOiJmNzd2X3czemliWHFndGl0NkVMOW9aX0s2MXFFb1lUMyIsInRhZyI6ImJicjhrSWdDV2RhNVVYa3BKa0VMWlEiLCJlcGsiOnsia3R5IjoiT0tQIiwiY3J2IjoiWDI1NTE5IiwieCI6IkxSOUZlMTMwbkRrTTFmcHVtYTUxaVc2blVrOHk1R3pZUnRmNEJ5RHFrRE0ifSwia2lkIjoiZGlkOmtleTp6Nk1rajNBSksycnc2VDVSWnp6eVU3UzV4ekpSOW9LcVlxdkhmQzczc2dGZ3hjWFIjejZMU3BpNVc3Wmt3eUpESzltaG9mNFlyUjNBWW0yelZFd1Joc3FLODZhank5OHhIIn19XX0='
//         let accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..OoSNVVWSb0nRIBim.zPj_kSAvF4Xd05JE6gYY01Q076ACMBB_EN3_JJsBZozB9mBZJ4wPvPJcK_ohwFvXO_-h9mlRduVQZF4QSM6AvpYPplcCNr1SYZxj8ugXrMeK1mHzt31shvoAOWK4uzhhN2VW4kMC5BKPD_5kgSFey6lfkQon42_IWsCs2VbV3hNLztW7ZZIEW3HP9PV1jMGEV9N5M3OZIB8lydRh43gEQuDIiUiBdt8d6Xjdpt3LrOYPu_y57E5D_SQM0rzt2YU_yvs_IiN7aBgXecoW0q8gZ9UCmP9H8apMxhacN67mz3W0nbU2Cekonzahm-1T.69qUJXmAuotLk-9NbaYKhQ'  
//         let boxSideKey = Buffer.from('0802b0dac4d3574b109ef32d5850b6a296d6255b0301a8c9b7ace56be4f4ae797eee41c7c0e4e40c829e99f2a8fe14ef48d9cfa0a710d360b1a5943ecfa42b1e9d03e8a74878d7af0a3b63ccd64eeaf7fd3c1e3bec937d6945317636464b0a492184', 'hex');
//         let jsonString = Buffer.from(jweB64, 'base64').toString()
        
//         console.log('jsonString: ', jsonString)

//         let decrypted = await tagged.decrypt(JSON.parse(jsonString))
//         console.log('decrypted: ', decrypted)
//         let clientSideKey = decrypted.accessKey
//         let sideKeys:any = []  
//         sideKeys.push(Buffer.from(clientSideKey, 'hex'), boxSideKey)
//         let accessKey: any = await new ProtectedAccessHeader()
//         .setDeclaration({
//             issuer: result.authDID,
//             audience: result.authDID,
//         }).verifyAccess(accessToken, sideKeys);

//         console.log('accessKey: ', accessKey);

      
//         should().not.Throw
//     });

//   });




// describe('Asymetric Encription', () => {

//     it('1- Issuer encryptes string with pubKey and decrypts with priKey', async () => {
//         const fulaDID = new FulaDID();
//         await fulaDID.create();
//         const asymEnc = new AsymEncryption(fulaDID.privateKey.slice(2));
//         let plaintext = {
//             symetricKey: '12345',
//             CID: 'aaaaaaaaaaaaaaa'
//         }
//         let jwe = await asymEnc.encrypt(plaintext.symetricKey, plaintext.CID, [asymEnc.publicKey]);
//         let ciphertext = await asymEnc.decrypt(jwe);
//         should().not.Throw
//         expect(JSON.stringify(plaintext)).to.equal(JSON.stringify(ciphertext));
//     });

//     it('2- Issuer encryptes string with pubKey and Audience decrypts with priKey', async () => {
//         // Issuer
//         const I_fulaDID = new FulaDID();
//         await I_fulaDID.create();
//         const I_asymEnc = new AsymEncryption(I_fulaDID.privateKey.slice(2));

//         // Audience
//         const A_fulaDID = new FulaDID();
//         await A_fulaDID.create();
//         const A_asymEnc = new AsymEncryption(A_fulaDID.privateKey.slice(2));

//         let plaintext = {
//             symetricKey: 'content-privateKey',
//             CID: 'Content ID'
//         }

//         // Issuer encrypts plaintext with Audience PublicKey
//         let jweCipher = await I_asymEnc.encrypt(plaintext.symetricKey, plaintext.CID, [A_asymEnc.publicKey]);

//         // Audience decrypts with private Key
//         let decrypted = await A_asymEnc.decrypt(jweCipher);

//         should().not.Throw
//         expect(JSON.stringify(plaintext)).to.equal(JSON.stringify(decrypted));
//     });

//     it('3- Issuer encryptes string with [A, B] pubKey and Audience decrypts with priKey', async () => {
//         // Issuer
//         const I_fulaDID = new FulaDID();
//         await I_fulaDID.create();
//         const I_asymEnc = new AsymEncryption(I_fulaDID.privateKey.slice(2));

//         // A - Audience
//         const A_fulaDID = new FulaDID();
//         await A_fulaDID.create();
//         const A_asymEnc = new AsymEncryption(A_fulaDID.privateKey.slice(2));


//         // B - Audience
//         const B_fulaDID = new FulaDID();
//         await B_fulaDID.create();
//         const B_asymEnc = new AsymEncryption(B_fulaDID.privateKey.slice(2));


//         let plaintext = {
//             symetricKey: 'content-privateKey',
//             CID: 'Content ID'
//         }

//         // Issuer encrypts plaintext with Audience PublicKey
//         let jweCipher = await I_asymEnc.encrypt(plaintext.symetricKey, plaintext.CID, [A_asymEnc.publicKey, B_asymEnc.publicKey]);

//         // Audience decrypts with private Key
//         let Adecrypted = await A_asymEnc.decrypt(jweCipher);
//         let Bdecrypted = await B_asymEnc.decrypt(jweCipher);


//         should().not.Throw
//         expect(JSON.stringify(plaintext)).to.equal(JSON.stringify(Adecrypted));
//         expect(JSON.stringify(plaintext)).to.equal(JSON.stringify(Bdecrypted));
//         expect(JSON.stringify(Adecrypted)).to.equal(JSON.stringify(Bdecrypted));
//     });


//     it('4- Unknown audience attempting to decrypt with own priKey', async () => {
//         // Issuer
//         const I_fulaDID = new FulaDID();
//         await I_fulaDID.create();
//         const I_asymEnc = new AsymEncryption(I_fulaDID.privateKey.slice(2));

//         // Known Audience
//         const A_fulaDID = new FulaDID();
//         await A_fulaDID.create();
//         const A_asymEnc = new AsymEncryption(A_fulaDID.privateKey.slice(2));

//         // Unkown Audience
//         const UN_fulaDID = new FulaDID();
//         await UN_fulaDID.create();
//         const UN_asymEnc = new AsymEncryption(UN_fulaDID.privateKey.slice(2));

//         let plaintext = {
//             symetricKey: 'content-privateKey',
//             CID: 'Content ID'
//         }

//         // Issuer encrypts plaintext with Known Audience PublicKey
//         let jweCipher = await I_asymEnc.encrypt(plaintext.symetricKey, plaintext.CID, [A_asymEnc.publicKey]);

//         // Unkown Audience Attepting to Decrypts onw Private Key but gets error
//         UN_asymEnc.decrypt(jweCipher).catch(err => {
//             err.should().Throw
//             should().exist(err)
//         })
//     });
//   });