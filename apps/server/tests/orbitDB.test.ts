import test from 'tape';
import { main, graceful, getLibp2p, getIPFS, getOrbitDb } from '../src/app';
import Libp2p from 'libp2p';
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
import wrtc from 'wrtc';
import Mplex from 'libp2p-mplex';
import { File, Blob } from '@web-std/file';
import { FileProtocol } from '@functionland/file-protocol';
import { Key } from 'openpgp';

const dbObj = [
    {
        key: 'user-0',
        value: {
            name: 'farhoud',
            age: 10
        }
    },
    {
        key: 'user-1',
        value: { name: 'ehsan',
        age: 20
     }
    }, {
        key: 'user-30',
        value: { name: 'emad',
        age: 20 }
    }, {
        key: 'user-4',
        value: { name: 'keyvan',
        age: 30 }
    }, {
        key: 'user-5',
        value: { name: 'mehdi',
        age: 40 }
    }, {
        key: 'user-6',
        value: { name: 'mahdi',
        age: 40 }
    }];

test('OrbitDB keyvalue test', async function (t) {
    // create borg server
    main().catch((e) => {
        t.fail(e);
    });
    try {
        const node = await getLibp2p();
        const ipfs = await getIPFS();
        const orbitDB = await getOrbitDb();
        t.pass('OrbitDb initial passed.');
        const db = await orbitDB.keyvalue('profile2');
        await db.load();
        t.pass('OrbitDb keyvalue loaded.');
        // Listen for updates from peers
        db.events.on("replicated", address => {
            console.log("replicated:", db.iterator({ limit: -1 }).collect());
        });
        const dbObj = [
            {
                key: 'user-0',
                value: {
                    name: 'farhoud',
                    age:[20,10]
                }
            },
            {
                key: 'user-1',
                value: { name: 'ehsan' }
            }, {
                key: 'user-30',
                value: { name: 'emad' }
            }, {
                key: 'user-4',
                value: { name: 'keyvan' }
            }, {
                key: 'user-5',
                value: { name: 'mehdi' }
            }, {
                key: 'user-6',
                value: { name: 'mahdi' }
            }];

        // Add an entry
        const promises = dbObj.map(obj => db.put(obj.key, obj.value));
        const addedList = await Promise.all(promises)
            .catch(error => t.fail(JSON.stringify(error)))
        console.log('list:', addedList)
        t.pass('OrbitDb add object.');

        // Query
        dbObj.forEach(obj => {
            const result = db.get(obj.key);
            console.log("result:", result);
            t.deepEqual(obj.value, result);
        })
    } catch (error) {
        t.fail("Failed:" + JSON.stringify(error));
    }
    t.pass('OrbitDb keyvalue done!!!');
    //Kill the main
    try {
        await graceful();
        t.end();
    } catch (error) {
        console.log('graceful',error);
    }
});

test('OrbitDB document test', async function (t) {
    // create borg server
    main().catch((e) => {
        t.fail(e);
    });
    try {
        const node = await getLibp2p();
        const ipfs = await getIPFS();
        const orbitDB = await getOrbitDb();
        t.pass('OrbitDb initial passed.');
        const db = await orbitDB.docs('orbit.users.profile'
        //, { indexBy: 'name' }
        )
        await db.load();
        t.pass('OrbitDb doc loaded.');
        // Listen for updates from peers
        db.events.on("replicated", address => {
            console.log("replicated:", db.iterator({ limit: -1 }).collect());
        });

        // Add an entry
        const promises = dbObj.map(obj => db.put({
            _id: obj.key,
            ...obj,
            name:obj.value.name,
        }));
        // Do not use promise to put data, this is just for test!
        const addedList = await Promise.all(promises)
            .catch(error => t.fail(JSON.stringify(error)))
        console.log('list:', addedList)
        t.pass('OrbitDb add object.');

        const containQuery = await db.get('eh');
        console.log('containQuery:',containQuery);
        const query = dbObj.map(obj => db.get(obj.value.name));
        
        const result = await Promise.all(query);
        result.map((res, index) => {
            console.log('Result:', res[0]);
            t.deepEqual(res[0], { ...dbObj[index],name:dbObj[index].value.name })
        })
        t.pass('OrbitDb test done!!!');
    } catch (error) {
        t.fail("Failed:" + JSON.stringify(error));
    } finally {
        // init
        // t.teardown(async () => {
        //     await graceful();
        // });
    }
    t.pass('OrbitDb doc done!!!');
    //Kill the main
    try {
        await graceful();
        t.end();
     } catch (error) {
         console.log('graceful',error);
     }
   
});