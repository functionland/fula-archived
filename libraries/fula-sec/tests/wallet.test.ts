// test did.ts
import { expect, should } from 'chai';
import {FullaDID} from "../src/index"

describe('DID', () => {
    it('1- Create random DID', async () => {
        const fullaDID = new FullaDID();
        let result = await fullaDID.create();
        should().not.Throw
        should().exist(result)
        result.should.be.an('object');
    });

    it('2- Create random DID and Backup', async () => {
        const fullaDID = new FullaDID();
        let result = await fullaDID.create();
        should().not.Throw
        expect(JSON.stringify(result)).to.equal(JSON.stringify(fullaDID.backup));        
    });

    it('3- Create random DID and Backup', async () => {
        const fullaDID = new FullaDID();
        let result = await fullaDID.create();
        should().not.Throw
        expect(JSON.stringify(result)).to.equal(JSON.stringify(fullaDID.backup));        
    });

    it('3- Create random DID and importMnemonic', async () => {
        const fullaDID = new FullaDID();
        let result = await fullaDID.create();
        let importedmem = await fullaDID.importMnemonic(result.mnemonic);
        let {privateKey, authDID} = result
        should().not.Throw
        expect(JSON.stringify({privateKey, authDID})).to.equal(JSON.stringify(importedmem));        
    });

    it('4- Create random DID and importMnemonic', async () => {
        const fullaDID = new FullaDID();
        let result = await fullaDID.create();
        let importedpk = await fullaDID.importPrivateKey(result.privateKey);
        let {privateKey, authDID} = result
        should().not.Throw
        expect(JSON.stringify({privateKey, authDID})).to.equal(JSON.stringify(importedpk));        
    });

    it('5- importMnemonic correct mnemoic', async () => {
        let meta = {
            mnemonic: 'mercy drip similar hole oil lock blast absent medal slam world sweet',
            privateKey: 'f0396d82b24b3f8f200cc240bb6d0770911c82e1d8c0199638373221efedabd5',
            authDID: 'did:key:z6MkeuGvVYEa5ooKyjYqYaLoWagyhFJetc7jmT3kRw9KCfAN'
        }; 
        const fullaDID = new FullaDID();
        let importedpk = await fullaDID.importMnemonic(meta.mnemonic.toString());
        let {privateKey, authDID} = meta
        should().not.Throw
        expect(JSON.stringify({privateKey, authDID})).to.equal(JSON.stringify(importedpk));        
    });

    it('5- import wrog Mnemonic 1', async () => {
        let meta = {
            mnemonic: 'mercy drip similar hole oil lock blast absent medal slam world sweet',
            privateKey: 'ff396d82b24b3f8f200cc240bb6d0770911c82e1d8c0199638373221efedabd5',
            authDID: 'did:key:z6MkeuGvVYEa5ooKyjYqYaLoWagyhFJetc7jmT3kRw9KCfAN'
        }; 
        const fullaDID = new FullaDID();
        let importedpk = await fullaDID.importMnemonic(meta.mnemonic.toString());
        let {privateKey, authDID} = meta
        expect(JSON.stringify({privateKey, authDID})).not.to.equal(JSON.stringify(importedpk));        
    });

    it('6- Import wrog privateKey 2', async () => {
        let meta = {
            privateKey: 'ff396d82b24b3f8f200cc240bb6d0770911c82e1d8c0199638373221efedabd5',
            authDID: 'did:key:z6MkeuGvVYEa5ooKyjYqYaLoWagyhFJetc7jmT3kRw9KCfAN'
        }; 
        const fullaDID = new FullaDID();
        let importedpk = await fullaDID.importMnemonic(meta.privateKey.toString());
        expect(JSON.stringify(meta)).not.to.equal(JSON.stringify(importedpk));        
    });
  });