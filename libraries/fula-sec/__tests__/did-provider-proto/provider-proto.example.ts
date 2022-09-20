import * as IPFS from 'ipfs-core';
import {createProvider} from './did-provider-mock/index.js';
import * as u8a from 'uint8arrays';
import { DID } from '../../src/did/did.js';
import { HDKEY } from '../../src/did/hkey/key.js';


async function createTrustedKeyDoc() {
  
  let hexSeed = '9d7020006cf0696334ead54fffb859a8253e5a44860c211d23c7b6bf842d0c63535a5efd266a647cabdc4392df9a4ce28db7dc393318068d93bf33a32adb81ae';
  console.log('seed: ', hexSeed)
  const ed = new HDKEY(hexSeed)
  const master = ed.createEDKey();
  console.log('master: ', master)
  const ipfs = await IPFS.create()
  console.log(ipfs)

  const didProvider = createProvider(ipfs, master.secretKey.slice(0, 32));


  const asymEnc = new DID(master.secretKey.slice(0, 32), master.publicKey);

  const {did} = await asymEnc.getDID(master.secretKey.slice(0, 32));   
  console.log('did: ', did)


  const didDocument = await didProvider.create(did, (document: {
    addPublicKey: (arg0: { type: string; publicKeyBase58: string; controller: Array<string>}) => any; 
    addAuthentication: (arg0: any) => any; // Auth/Verification method
    addService: (arg0: { id: string; type: string; serviceEndpoint: string; }) => any; 
  }) => {
        const publicKey = document.addPublicKey({
            type: 'X25519KeyAgreementKey2019',
            publicKeyBase58: u8a.toString(master.publicKey, 'base58btc'),
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