import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"
import {AccessToken} from '../src/access/access.token'

describe('Access Token and Signature Verifyer', () => {
    it('1- ', async () => {
        const fulaDID = new FulaDID();
        const result = await fulaDID.create();
        console.log('result: ', result)
        const Atoken = new AccessToken({
            payload: 'any',
            issuer:'string',
            audience: 'string',
            expt: 'string',
            token: 'string',
            alg: 'string',
            jws: 'string' 
        })
        // TODO fix Access Token class and separate interfase for functions
        // functionlar un alohida interface qilishim kk
        should().not.Throw
    });
  });