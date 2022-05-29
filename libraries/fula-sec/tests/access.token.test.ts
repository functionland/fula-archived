import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"
import {ProtectedAccessHeader} from '../src/access/access.token'
import {getPublicJWK, getPrivateJWK, getPublicJWKfromPrivateKey} from '../src/access/elliptic.key'
import * as jose from 'jose'

describe('Access Token and Signature Verifyer', () => {
    it('1- ', async () => {
        const fulaDID = new FulaDID();
        const result = await fulaDID.create();
        // console.log('fulaDID: ', result)
    
        const jwt = await new ProtectedAccessHeader()
        .setDeclaration({
            issuer: result.authDID,
            audience: result.authDID,
            expt: '1h',
            payload: {
                jwe: "aaa",
                CID: "bbbb"
            }
        }).signer(result.privateKey);

        console.log('jwt: ', jwt)

        
        let pubJWK = getPublicJWKfromPrivateKey(result.privateKey)
        console.log('pubJWK: ', pubJWK)

        const verify = await new ProtectedAccessHeader()
        .verifyAccessKey(jwt, pubJWK);
        console.log('verify: ', verify)

        should().not.Throw
    });
  });