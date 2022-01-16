import test from 'tape';
import {Kind, OperationDefinitionNode, OperationTypeNode, parse} from 'graphql';
import {getCollection, getFields, getFilter, runQuery, reGetFilter} from '../src/engine/query'
import {getIPFS, getLibp2p, getOrbitDb, graceful, main} from "../src/app";

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

const expected1 = {
    profile: [
        { name: 'keyvan', age: 30 },
        { name: 'ehsan', age: 35 },
        { name: 'mehdi', age: 30 }
    ]
}


const testQuery1 = `
  query  { profile (filter: { 
    name: { ne: "mahdi" },
    age: { gt: 25 }
    }){
      name
      age
      }
    }  
`;

const deepQuery = `query  { profile (filter: {
    or: [
    {age: {gt: 30}},
    {and: [
        {name: {ne: "mahdi"}},
        {name: {ne: "mehdi"}},
        {age: {gt: 15}}
    ]}
    ]
}){
      name
      age
      }
    } `

const tQ1 = parse(testQuery1)
const tQ2 = parse(deepQuery)

test('Test recursive getFilter', async function (t) {
    const def = tQ2.definitions[0] as OperationDefinitionNode

    const filter = reGetFilter(def.selectionSet.selections[0].arguments[0].value.fields[0])

    console.log(testData.map(doc => filter(doc)))
})

// test('Test Internal Functions', async function (t) {
//     const def = tQ1.definitions[0] as OperationDefinitionNode

//     t.equal(getCollection(def), "profile", `collection name should be equal`)
//     t.equal(getFilter(def)(testData[0]), false, "filter for docs[0] should return false")
//     t.equal(getFilter(def)(testData[1]), true, "filter for docs[1] should return true")
//     t.equal(getFilter(def)(testData[2]), false, "filter for docs[2] should return true")
//     t.equal(getFilter(def)(testData[3]), true, "filter for docs[3] should return false")
//     t.equal(getFilter(def)(testData[4]), false, "filter for docs[4] should return false")
//     t.equal(getFilter(def)(testData[5]), true, "filter for docs[5] should return false")
//     t.deepEqual(getFields(def), ['name','age'], "fields should be equal")
//     t.end()
//     // t.equal(filter, )
// })

// test('Integration Test With Orbit Db', async function (t) {
//     // create borg server
//     main().catch((e) => {
//         t.fail(e);
//     });
//     try {
//         const node = await getLibp2p();
//         const ipfs = await getIPFS();
//         const orbitDB = await getOrbitDb();
//         t.pass('OrbitDb initial passed.');
//         // Insert Sample Data
//         const db = await orbitDB.docs('profile');
//         await db.load();
//         const promises = testData.map(obj => db.put({
//             _id: obj.key,
//             ...obj
//         }));
//         await Promise.all(promises)
//             .catch(error => t.error(error))
//         t.pass(`Sample Data Inserted`)

//         const gqlquery = parse(testQuery1)
//         t.ok(gqlquery.kind === Kind.DOCUMENT, 'Test Query parsed and validated')
//         const defs = gqlquery.definitions.filter(def => def.operation === OperationTypeNode.QUERY);
//         const result = await runQuery(orbitDB, defs[0]);
//         t.deepEqual(result,expected1, 'runQuery Returns expected data')
//     } catch (error) {
//         t.error(error);
//     }

//     t.pass('OrbitDb doc done!!!');
//     t.end()

//     await graceful();

// });
