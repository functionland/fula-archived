import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"
import {ProtectedAccessHeader} from '../src/access/access.token'
import {getPublicJWK, recoverPublicJWK} from '../src/access/elliptic.key'
import * as jose from 'jose'

describe('Access Token and Signature Verifyer', () => {
    // it('1- ', async () => {
    //     const fulaDID = new FulaDID();
    //     // const result = await fulaDID.create()
                            
    //     let privateKey = '0xb3ad7e6a8b9440d648dfa4b35e067f39c18aae59c6e05f01af9ba73a10828781'
    //     let result = await fulaDID.create(privateKey, 'aaaaa');
    //     console.log('fulaDID: ', result)
    
    //     let jwt = await new ProtectedAccessHeader()
    //     .setDeclaration({
    //         issuer: result.authDID,
    //         audience: result.authDID,
    //         expt: '1h',
    //         CID: 'Qmhjhu8783jhjkfa'
    //     }).sign(result.privateKey);

    //     console.log('jwt: ', jwt);

        
    //     let _pubJWK = getPublicJWK(result.privateKey)
    //     console.log('>> _pubJWK: ', _pubJWK)

    //     const verify = await new ProtectedAccessHeader()
    //     .verifyAccess(jwt, 'd703ea2405f8347ff3e05521660ea7fe99d872efc80bd80e3340614e855ccca5', _pubJWK);
    //     console.log('verify: ', verify)

    //     should().not.Throw
    // });
  });