import * as IPFS from 'ipfs-core';
// import {getDidFromPem} from './index.js';
import {createProvider} from './did-provider-mock/index.js';
import * as u8a from 'uint8arrays';
import { generateKeyPairFromSeed } from '@stablelib/x25519';
import { DID } from '../../src/did/did.js';
import { getMasterKeyFromSeed } from '../../src/did/hkey/key.js';


async function createTrustedKeyDoc() {

  let hexSeed = 'simple squirrel mirror answer please often device decide demand bottom harvest range';
  console.log('seed: ', hexSeed)

  const master = getMasterKeyFromSeed(hexSeed);
  let keyPair = generateKeyPairFromSeed(master.key.slice(0, 32));
  console.log('keyPair for JWE TEST: ', keyPair);

    const ipfs = await IPFS.create()

    const didProvider = createProvider(ipfs, keyPair.secretKey);


    const asymEnc = new DID(keyPair.secretKey, keyPair.publicKey);

    const {did} = await asymEnc.getDID(keyPair.secretKey);   
    console.log('did: ', did)


    const didDocument = await didProvider.create(did, (document: {
    addPublicKey: (arg0: { type: string; publicKeyBase58: string; controller: Array<string>}) => any; 
    addAuthentication: (arg0: any) => any; // Auth/Verification method
    addService: (arg0: { id: string; type: string; serviceEndpoint: string; }) => any; 
  }) => {
        const publicKey = document.addPublicKey({
            type: 'X25519KeyAgreementKey2019',
            publicKeyBase58: u8a.toString(keyPair.publicKey, 'base58btc'),
            controller: [did]
            // TODO Add Param: Blockchain Account, chain ID 
        });
        console.log('publicKey: ', publicKey)

        const authentication = document.addAuthentication(publicKey.id);
        console.log('authentication: ', authentication)

        const service = document.addService({
            id: 'fula',
            type: 'FulaService',
            serviceEndpoint: 'https://fula.provider.com/',
        });
        console.log('service: ', service)
    });

    console.log('didDocument: ', didDocument)


    let resolve = await didProvider.resolve(did);
    console.log('resolve: ', resolve)


    let encrypters:any = await didProvider.resolveEncrypters([did]);
    console.log('encrypters: ', encrypters)


    let plaintext = {
      symetricKey: '12345',
      CID: 'aaaaaaaaaaaaaaa'
    }
    let jwe = await asymEnc.createJWE(plaintext, encrypters);
    console.log('jwe: ', jwe)

    let ciphertext = await asymEnc.decryptJWE(jwe)
    console.log('ciphertext: ', ciphertext)
}
createTrustedKeyDoc();