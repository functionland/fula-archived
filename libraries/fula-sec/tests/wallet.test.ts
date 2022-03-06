// test did.ts
import test from "tape";
import { FullaDID } from "../src/did";

test('resolveLater', async (t) => {
    // const [promise, resolve] = resolveLater();
    // resolve(42);
    // t.equal(await promise, 42, 'Promise resolves');
});

(async()=>{
    const fullaDID = new FullaDID();
    let did = await fullaDID.create();
    console.log('did: ', did);
    console.log(fullaDID.backup);

    const fullaDID1 = new FullaDID();
    let importedmem = await fullaDID1.importMnemonic(did.mnemonic);
    console.log('importedmem did: ', importedmem);
    let importedKey = await fullaDID1.imposrtPrivateKey(did.privateKey);
    console.log('importedKey did: ', importedKey);
    console.log(fullaDID1.backup);
})();