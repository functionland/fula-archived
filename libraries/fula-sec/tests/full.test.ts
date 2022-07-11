import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"
import {ProtectedAccessHeader} from '../src/access/access.token'
import {getPublicJWK, recoverPublicJWK} from '../src/access/elliptic.key'

describe('Access Token and Encryt/Decrypt', () => {
    it('1- ', async () => {
        const fulaDID = new FulaDID();
                            
        let result = await fulaDID.activate({
            secretKey: '48dfa4b35e067f39c18aae59c6e05f01af9ba73',
            signature: 'b3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
        });
        console.log('fulaDID: ', result)
    
        let header: any = await new ProtectedAccessHeader()
        .setDeclaration({
            issuer: result.authDID,
            audience: result.authDID,
            expt: '1h',
            CID: 'Qmhb9440d648dfa4b35e067f39c18aae59c6e05f01af9b'
        }).createAccess();

        console.log('header: ', header);

        // const tagged = new TaggedEncryption(fulaDID.did);

        let symetricKey = '12345';
        console.log('secrets: ', { symetricKey,  clientSideKey: header.sideKeys[0] })
     
        let jwe = await fulaDID.encrypt(symetricKey, header.sideKeys[0], [result.authDID])
        let objJsonStr = JSON.stringify(jwe);
        let jweB64 = Buffer.from(objJsonStr).toString("base64");
        console.log('jweB64: ', jweB64)

        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-')
        console.log('Share: >>', {
            accessToken: header.accessToken,
            sideKey: header.sideKeys[1],
            jweB64
        })
        
        let decrypted = await fulaDID.decrypt(jwe)
        console.log('decrypted: ', decrypted)
        should().not.Throw
    });

    it('2- ', async () => {
        const fulaDID = new FulaDID();
                            
        let result = await fulaDID.activate({
            secretKey: '48dfa4b35e067f39c18aae59c6e05f01af9ba73',
            signature: 'b3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
        });
        console.log('fulaDID: ', result)
    
        // const tagged = new TaggedEncryption(fulaDID.did);

        let jweB64 = 'eyJwcm90ZWN0ZWQiOiJleUpsYm1NaU9pSllRekl3VUNKOSIsIml2IjoiRi12NDdwb19qT2VINl9rYVJueHo1Zy1oM3ZtWThkclAiLCJjaXBoZXJ0ZXh0Ijoib3F0T0ZITmRMTTJoelV2QmVicDV4N0h6Q0NHa1QxWGE3aVdfV2dHVVh4VE9VbXpUcjd0N2VhRFVBVXZvZUdnSUp3SzhrTXIyWmdjVDhBQ3A0aW52UlZ3elZqbE9KQkRwb3ZpeWV0QkxRSWJLY1ZMbkgxWm9pdkFDLTN6bzVmT1pCb2ZSWDVTR1FwY2hyU2E0c2ozUnIyNF9yb1VtNWRjMk91d19WUnJmZDZfc3ZIVm5ySllLTFQtSzdGVjFJVndaMzh0ekt3RnhfVjZRdFNmTDNuOUtrclgzQXRwT2o3WEttRW50SUlsZE84RUpiVXBHMVdjQnpvSm05WHNsdmpjd0o0OXlaaXFBdlJtdkI1ZC1qVDFEdndxeEtsa1JnYnBMM3JCaU1sM1RIeTRvOXg5REVuTzU1emZfVzhHb2xjUUMiLCJ0YWciOiJZNUlPaFZuMTRtazhJZERTS1pNOFhnIiwicmVjaXBpZW50cyI6W3siZW5jcnlwdGVkX2tleSI6InNOc2g1SnBtU2FBYmRYSU5IUnNIdFJ3cUJmbm5OY2tCQTJIdmpBZXR4QTQiLCJoZWFkZXIiOnsiYWxnIjoiRUNESC1FUytYQzIwUEtXIiwiaXYiOiJjNnJRV0hZMHFSRlFMMllqNW9xTVoxY1FkUFZNTy1QVSIsInRhZyI6ImdtcjdkSnFtS2xVbzlGTVVjdkF6a3ciLCJlcGsiOnsia3R5IjoiT0tQIiwiY3J2IjoiWDI1NTE5IiwieCI6IllhdWhnWlhsVnVmUFQ3d2t2alE3a1FvOXl6Tk0tamdjczRmYkVWazV1a0UifSwia2lkIjoiZGlkOmtleTp6Nk1rbm9tYVRzZWl5bTZxRUpTM3k4cDJXMXVyZ1I3aVdvbm85Mzd3TXhWZ2FRYUQjejZMU2c0QVZhV1RmZkU4eE5YNE1kNXVMbU4xZ3lqZU0xREc4aU40cEVNa1hQa3RhIn19XX0='
        let accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..7rRAkidtcBS6FMJ2.wDnNLhzAWChlLyhfuy-TGfcNjO-lkkMd56cZfkIAywd21byDF4v5FYsoG_YTMME9706PHX8yBWRBqoP_KAHg2uA0oS4Y1elvtGqq2v07WE4MSO33PK4F4ibLXY0vB4ylRmSyQCMdthqIa2EBWX9KH0k5Q5ByzR5nMvszVyhHqVVUWXqiCOHmAT6IXVbaGBBOtyts2VID0F5Wi9CZUvr-jj5dfkP9xlQmLth5u0u_Oe7zL-NM8qUkDD07jXt6hOHYwm8B88NtSvarPdPgpgVBo5bcwzKOKjXxPuNeAPCYwnHr8Tafqna7mb1_qqGu.eLDaHWjOsVpRU2JEYKl1YA'  
        let boxSideKey = Buffer.from('0802496cbe185c8e3ba15953d387be278ecd4f518659b6fa1e286467ffff57f767938466a24786056b41b9e46f90aeb4ab3292b69866c15805a6b44cbc099b23629bd59a2705d53109bcd473e9a8998f606832fba9a9cf6b9aedeea6215965c56355', 'hex');
        let jsonString = Buffer.from(jweB64, 'base64').toString()
        
        console.log('jsonString: ', jsonString)

        let decrypted = await fulaDID.decrypt(JSON.parse(jsonString))
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