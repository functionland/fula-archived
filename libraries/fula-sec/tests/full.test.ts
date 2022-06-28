import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"
import {ProtectedAccessHeader} from '../src/access/access.token'
import {getPublicJWK, recoverPublicJWK} from '../src/access/elliptic.key'

describe('Access Token and Encryt/Decrypt', () => {
    it('1- ', async () => {
        const fulaDID = new FulaDID();
                            
        let result = await fulaDID.activate({
            secretKey: 'vvvvvv',
            signature: 'b3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
        });
        console.log('fulaDID: ', result)
    
        let accessKey: any = await new ProtectedAccessHeader()
        .setDeclaration({
            issuer: result.authDID,
            audience: result.authDID,
            expt: '1h',
            CID: 'Qmhb9440d648dfa4b35e067f39c18aae59c6e05f01af9b'
        }).createAccess();

        console.log('accessKey: ', accessKey);

        const tagged = new TaggedEncryption(fulaDID.did);

        let plaintext = {
            symetricKey: '12345',
            CID: 'aaaaaaaaaaaaaaa'
        }
     
        let jwe = await tagged.encrypt(plaintext.symetricKey, accessKey.sideKeys[0], [fulaDID.did.id])
        let objJsonStr = JSON.stringify(jwe);
        let jweB64 = Buffer.from(objJsonStr).toString("base64");
        console.log('jweB64: ', jweB64)
        
        let decrypted = await tagged.decrypt(jwe)
        console.log('decrypted: ', decrypted)
        should().not.Throw
    });

    it('2- ', async () => {
        const fulaDID = new FulaDID();
                            
        let result = await fulaDID.activate({
            secretKey: 'vvvvvv',
            signature: 'b3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
        });
        console.log('fulaDID: ', result)
    
        const tagged = new TaggedEncryption(fulaDID.did);

        let jweB64 = 'eyJwcm90ZWN0ZWQiOiJleUpsYm1NaU9pSllRekl3VUNKOSIsIml2IjoiVlB6T0ZuTWUwRUo0YS1mS01WZVMzX3ExR092Q2t2enkiLCJjaXBoZXJ0ZXh0IjoiWlVPTWNRT2dPcFBaa1RCZFVMekVJdERrNnMzWUVWT0UwcURFT19CX0dROUMxdjlqSU5XTkpIT2M2VGJrNjFrVXM5X09Dbm9CSEoxRHVPMjlLVDd0QWx4NDJwai1ocHdkUC1QdHNoZ1M3TXdXXzFpcUNkYmxxVzdLblZxZllDaDV5SHlFX0NUc1MwUk44U3ptSlFxbjVVV3JsUlpyUE1wd3pnWmE3V2JST1ZBeFlWOTA4UWcxLW1pOEdBWWRKanFwUFpKVjBpM0xYQTBDN3hQQk84QnlaU3M1SjNYb0UyRTI1OEFxRGRmTl9YS1pMQ3J1OW9SbDlxa2hOVzhZYi0tSU5NN2F6MUtJT0dNWEM1YTh2bUNNbEwwM2VLRGJWNVE3eUF6cGZVUnZ5NDRnakdnVGVaMnVLa01nZXR4Zkt0d1QiLCJ0YWciOiJpODlXcmx5aHlWdGFnanJwXzVNcU5nIiwicmVjaXBpZW50cyI6W3siZW5jcnlwdGVkX2tleSI6IlpBS0h0OUZfcEFxMGJ4VVR6NUhWdy1abVZnSTB4ZGN3blRHOXZxN3lOSm8iLCJoZWFkZXIiOnsiYWxnIjoiRUNESC1FUytYQzIwUEtXIiwiaXYiOiJ5aTZrMEpTWGdXcDhkTld1ZVpUVGY0cU1WNjViS3FNSSIsInRhZyI6IllmS1hFVEpjQU9sMjY0b21ua0swQ0EiLCJlcGsiOnsia3R5IjoiT0tQIiwiY3J2IjoiWDI1NTE5IiwieCI6IkFOYnRVb3JQaHBzTmluQlpSWDNOOWFhMklCUHhFbWZmUGQ3eHJ3cEJpbDAifSwia2lkIjoiZGlkOmtleTp6Nk1rajNBSksycnc2VDVSWnp6eVU3UzV4ekpSOW9LcVlxdkhmQzczc2dGZ3hjWFIjejZMU3BpNVc3Wmt3eUpESzltaG9mNFlyUjNBWW0yelZFd1Joc3FLODZhank5OHhIIn19XX0='
        let accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Q4jhl0Bnaeh9qQdn.O3VLz8a24r2MJcPdELraZ4HEHenUJgmIoaj0MJRhDG8UaZeG5y-hUdKxe_SQAP29Rxrw0eawKW4dylLkj3ZU4smQ0wQLGxtVYfzkhjPhIQPo5dOGAumkuoKMLTU0NVRF_TjVRLrwLo80-g7C8rGg2wXBiVGCDigEuC76zadYxUAnvme5DX8erMysZhnOqZ4Of_5_kuEzCgkvWxbZOn6Z2QyV8fOHTxF2PN_-ZfUWfLUSOS_9QfJh13rNcEjxw-hnK7FOBkyFJvwdkfPp912FVmVMt9AIunt_mAYzzqGAYcXo2GrvfuT3gBD8Z4c3.3gN1o4DIybvbvJzXsTQHeQ'  
        let boxSideKey = Buffer.from('08029be90e9616f00969d639a14e44235bd94ec62a9e34ef514e43c6d57daa3335618c40fd8553511473c5127e896f6d3e81ed6e9e570af9a415bfec45ee6ec2803f8cf93fdebee80cfe98f85550cebb1b69bf18fd7f79f463fc75adae50122f78d5', 'hex');
        let jsonString = Buffer.from(jweB64, 'base64').toString()
        
        console.log('jsonString: ', jsonString)

        let decrypted = await tagged.decrypt(JSON.parse(jsonString))
        console.log('decrypted: ', decrypted)
        let clientSideKey = decrypted.accessKey
        let sideKeys:any = []  
        sideKeys.push(Buffer.from(clientSideKey, 'hex'), boxSideKey)
        let accessKey: any = await new ProtectedAccessHeader()
        .setDeclaration({
            issuer: result.authDID,
            audience: result.authDID,
        }).verifyAccess(accessToken, sideKeys);

        console.log('accessKey: ', accessKey);

      
        should().not.Throw
    });

  });