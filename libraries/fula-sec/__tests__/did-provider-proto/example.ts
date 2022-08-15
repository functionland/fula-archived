import * as IPFS from 'ipfs-core';
import {getDidFromPem} from './index.js'
import {createProvider} from './did-provider-mock/index.js';

export const pem = `
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDCQZyRCPMcBPL2J2SuI2TduR7sy28wmcRzfj8fXQTbj1zJURku
y93CIt4M6caXL29sgN2iAArLr73r2ezs+VGiCoAtIudl6qMwUG2O0hjdyiHDtCcj
w6Ic6LVCWr6HcyShTmvRGNC6ZdONgjOHVubzoev1lqxIEVMXzCMm7RkQOwIDAQAB
AoGBAKMi8teiingXd+tdPeI4ezbxhpUaa7CHEkJj3aL7PV8eULAI2XtBXmTxX0W8
9jh1b7/RoU+xdV+FoZv2klCZOQHCavqryGV7ffZlETtdxz2vmBHEh04j3eBcWCod
ppFhx3jx2EhYwIh1klHj1Ybl/r3MCR6aRhER5zCMCC1XSgVxAkEA9F60bp6imTSb
+C4CagcMiD36e+6K1CZ2refJ4T3dj88hqxjK9SKlji0aYqIK1sMNcEoeNjz6bn/u
1TyeCteWpwJBAMuAWCQwuA/4wKFB3OERB3gsBi+9yjJqZE9b648I+uTdbP1EHGVV
iHSVHxBQjOJ/vG48GrsWDBlSKsz6txCRQE0CQQC536NMlNtGv053er+ZWF0+8C2r
wKjWb59L7gePjRgO/9UzKDuQM9dLiqEMLwchjeGV7LqINN+j1ymaBm6L/qn3AkAI
9h/riBGy8ltZPpNBfgR8MEQdehgbXEAKlpuq8tRJm86e4I73j2qw55g0mbd6ifF8
UT1EG9ZwjwO/fxLssdjJAkBFTNbIqFnSkaVXIi54oXwqYl1/1h/MqoHoWdY0ZVCc
ttrI1rZSmCBbKkicdvBsJo2c916giPwGpcGIzlrt72sW
-----END RSA PRIVATE KEY-----`;


async function main() {
    const ipfs = await IPFS.create()

    const didProvider = createProvider(ipfs);
    console.log('didProvider: ', didProvider);
    const did = await getDidFromPem(pem);   
    console.log('did: ', did)

    const didDocument = await didProvider.create(pem, (document: { addPublicKey: (arg0: { type: string; publicKeyHex: string; }) => any; addAuthentication: (arg0: any) => any; addService: (arg0: { id: string; type: string; serviceEndpoint: string; }) => any; }) => {
        const publicKey = document.addPublicKey({
            type: 'RsaVerificationKey2018',
            publicKeyHex: '02b97c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71',
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


    let res = await didProvider.resolve(did);
    console.log('res: ', res)
}

main()