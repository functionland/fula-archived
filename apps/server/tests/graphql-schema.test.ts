import test from 'tape';
import { main, graceful, getLibp2p, getIPFS, getOrbitDb } from '../src/app';
import gql from 'graphql-tag';
import {
  graphql,
  buildSchema,
  execute,
  GraphQLObjectType,
  OperationTypeNode
} from 'graphql';
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';
import { schema, resolvers } from '../src/engine/graphql';
import { getFields, selector } from 'src/engine/query';
import { executeAndSelect } from 'src/engine/graphql-CRUD';

// test('Simple execute graphgql test', async function (t) {
//     const typeDefs = `
//     scalar JSON
//     scalar JSONObject
//     type Query {
//         hello (input:JSON): [JSON]
//     }
//     `;

//     const resolvers = {
//       JSON: GraphQLJSON,
//       JSONObject: GraphQLJSONObject,
//     };

//     let schema = makeExecutableSchema({ typeDefs, resolvers });

//     // The root provides a resolver function for each API endpoint
//     let root = {
//         hello: async (input) => {
//             console.log("input",JSON.stringify(input))
//             return await new Promise(resolve => resolve(
//                 // [[{
//                 //     field:'words',
//                 //     value:'Hello world!'}]]
//                 [{words:'Hello world!'}]
//                 ));
//         },
//     };

//     try {

//         const docNode=gql`query {hello(input:{key:{eq:"value"}})}`;
//         const  response= await execute({
//             schema,
//             document:docNode ,
//             rootValue:root});
//         console.log("graphql:", JSON.stringify(response));

//     } catch (error) {
//         console.log("error", error)
//     }
// });

const testData = [
  {
    key: '0',
    name: 'mahdi',
    age: 40
  },
  {
    key: '1',
    name: 'keyvan',
    age: 30
  },
  {
    key: '2',
    name: 'emad',
    age: 15
  },
  {
    key: '3',
    name: 'ehsan',
    age: 35
  },
  {
    key: '4',
    name: 'farhoud',
    age: 25
  },
  {
    key: '5',
    name: 'mehdi',
    age: 30
  }
];

test('Graphgql on OrbitDB test', async function (t) {
  try {
    main().catch((e) => {
      t.fail(e);
    });
    const node = await getLibp2p();
    const ipfs = await getIPFS();
    const orbitDB = await getOrbitDb();

    const db = await orbitDB.docs('profile');
    await db.load();
    await db.drop();
    const promises = testData.map((obj) =>
      db.put({
        _id: obj.key,
        ...obj
      })
    );
    const addedList = await Promise.all(promises).catch((error) =>
      t.fail(JSON.stringify(error))
    );
    t.pass(`Sample Data Inserted ${JSON.stringify(addedList, null, 2)}`);

    const readAllProfiles = gql`
      query {
        read(input: { collection: "profile", filter: {} }) {
          _id
          name
          age
          key
        }
      }
    `;
    let expected = {
      data: { read: testData.map((obj) => ({ _id: obj.key, ...obj })) }
    };
    let res = await executeAndSelect(readAllProfiles);
    t.deepEqual(res, expected, 'should pass readAllProfiles query');

    const read = gql`
      query {
        read(
          input: {
            collection: "profile"
            filter: {
              and: [{ name: { nin: ["keyvan", "mahdi"] } }, { age: { gt: 15 } }]
            }
          }
        ) {
          _id
          name
        }
      }
    `;

    expected = {
      data: {
        read: [
          { _id: '3', name: 'ehsan' },
          { _id: '4', name: 'farhoud' },
          { _id: '5', name: 'mehdi' }
        ]
      }
    };
    res = await executeAndSelect(read);
    t.deepEqual(res, expected, 'should pass read query');

    const create = gql`
      mutation {
        create(
          input: {
            collection: "profile"
            values: [{ _id: "6", age: 33, name: "jamshid", key: "6" }]
          }
        ) {
          _id
          name
          age
          key
        }
      }
    `;
    expected = {
      data: { create: [{ _id: '6', name: 'jamshid', age: 33, key: '6' }] }
    };
    res = await executeAndSelect(create);
    t.deepEqual(res, expected, 'should pass create query');

    const update = gql`
      mutation {
        update(
          input: {
            collection: "profile"
            values: [{ _id: "2", age: 18, name: "emad", key: "2" }]
          }
        ) {
          _id
          name
          age
          key
        }
      }
    `;
    expected = {
      data: { update: [{ _id: '2', name: 'emad', age: 18, key: '2' }] }
    };
    res = await executeAndSelect(update);
    t.deepEqual(res, expected, 'should pass update query');

    const updateQuery = gql`
      mutation {
        updateQuery(
          input: {
            collection: "profile"
            filter: { age: { gt: 30 } }
            value: { age: 70 }
          }
        ) {
          _id
          name
          age
          key
        }
      }
    `;
    expected = {
      data: {
        updateQuery: [
          { _id: '0', name: 'mahdi', age: 70, key: '0' },
          { _id: '3', name: 'ehsan', age: 70, key: '3' },
          { _id: '6', name: 'jamshid', age: 70, key: '6' }
        ]
      }
    };
    res = await executeAndSelect(updateQuery);
    t.deepEqual(res, expected, 'should pass updateQuery query');

    const remove = gql`
      mutation {
        delete(input: { collection: "profile", ids: ["6"] }) {
          _id
          name
          age
          key
        }
      }
    `;
    expected = {
      data: {
        delete: ['6']
      }
    };
    res = await executeAndSelect(remove);
    t.deepEqual(res, expected, 'should pass remove query');

    expected = {
      data: {
        read: [
          { _id: '0', name: 'mahdi', age: 70, key: '0' },
          { _id: '1', name: 'keyvan', age: 30, key: '1' },
          { _id: '2', name: 'emad', age: 18, key: '2' },
          { _id: '3', name: 'ehsan', age: 70, key: '3' },
          { _id: '4', name: 'farhoud', age: 25, key: '4' },
          { _id: '5', name: 'mehdi', age: 30, key: '5' }
        ]
      }
    };
    res = await executeAndSelect(readAllProfiles);
    t.deepEqual(res, expected, 'should pass readAllProfiles query afterall');

    t.end();
    await graceful();
  } catch (error) {
    console.log('error', error);
    t.end(error);
    await graceful();
  }
});
