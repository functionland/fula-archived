import { expect, should } from 'chai';
import {FulaDID, TaggedEncryption} from "../src/index"
import {ProtectedAccessHeader} from '../src/access/access.token'

describe('Access Token and Signature Verifyer', () => {
    it('1- ', async () => {
        const fulaDID = new FulaDID();
        const result = await fulaDID.create();
        console.log('result: ', result)
        should().not.Throw
    });
  });