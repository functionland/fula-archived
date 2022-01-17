import test from 'tape';
import {getIPFS, getLibp2p, getOrbitDb, graceful, main} from '../src/app';
import {Kind, OperationTypeNode, parse} from "graphql"

import {runQuery} from '../src/engine'

const testQuery1 = `
  query  { profile (filter: { 
    name: { ne: "mehdi" },
    age: { gt: 10 }
    }){
      name
      age
      }
    }  
`;

const gqlMutation = `
mutation profile(input:[{
    name:'keyvan'
    }]){
        _id
        name
    }
`;

const testData = [
    {
        key: '0',
        name: 'mahdi',
        age: 40,
    },
    {
        key: '1',
        name: 'keyvan',
        age: 30,
    }, {
        key: '2',
        name: 'emad',
        age: 15,
    }, {
        key: '3',
        name: 'ehsan',
        age: 35,
    }, {
        key: '4',
        name: 'farhoud',
        age: 25,
    }, {
        key: '5',
        name: 'mehdi',
        age: 30,
    },
];

const expected = {
    profile: [
        { name: 'mahdi', age: 40 },
        { name: 'keyvan', age: 30 },
        { name: 'emad', age: 15 },
        { name: 'ehsan', age: 35 },
        { name: 'farhoud', age: 25 }
    ]
}

test('Graphgql parser', async function (t) {
    // create borg server
    main().catch((e) => {
        t.fail(e);
    });
    try {
        const node = await getLibp2p();
        const ipfs = await getIPFS();
        const orbitDB = await getOrbitDb();
        t.pass('OrbitDb initial passed.');
        // Insert Sample Data
        const db = await orbitDB.docs('profile');
        await db.load();
        const promises = testData.map(obj => db.put({
            _id: obj.key,
            ...obj
        }));
        const addedList = await Promise.all(promises)
            .catch(error => t.fail(JSON.stringify(error)))
        t.pass(`Sample Data Inserted ${JSON.stringify(addedList, null, 2)}`)

        const gqlquery = parse(testQuery1)
        t.ok(gqlquery.kind === Kind.DOCUMENT, 'Test Query parsed and validated')
        const defs = gqlquery.definitions.filter(def => def.operation === OperationTypeNode.QUERY);
        const result = await runQuery(orbitDB, defs[0]);
        t.deepEqual(result,expected)
    } catch (error) {
        t.error(error);
    }

    t.pass('OrbitDb doc done!!!');
    t.end()

    await graceful();

});
