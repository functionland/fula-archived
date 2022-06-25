import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"
import {ProtectedAccessHeader} from '../src/access/access.token'
import {getPublicJWK, recoverPublicJWK} from '../src/access/elliptic.key'
import * as jose from 'jose'

describe('Access Token and Signature Verifyer', () => {
    it('1- ', async () => {
        const fulaDID = new FulaDID();
        // const result = await fulaDID.create()
                         
        let privateKey = '0xb3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
        let result = await fulaDID.importPrivateKey(privateKey);
        console.log('fulaDID: ', result)
    
        let jwt = await new ProtectedAccessHeader()
        .setDeclaration({
            issuer: result.authDID,
            audience: result.authDID,
            expt: '1h',
            CID: 'Qmhjhu8783jhjkfa'
        }).sign(result.privateKey);

        console.log('jwt: ', jwt);

        
        let _pubJWK = getPublicJWK(privateKey)
        console.log('_pubJWK: ', _pubJWK)

        const verify = await new ProtectedAccessHeader()
        .verifyAccess(jwt, '77a413a55b69ec9809633745576e38010ec56b395b328a6ff0ff33c7a3e3d261', _pubJWK);
        console.log('verify: ', verify)

        should().not.Throw
    });
  });