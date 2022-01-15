import test from 'tape';
import { main, graceful, getLibp2p, getIPFS, getOrbitDb } from '../src/app';
import gql from 'graphql-tag';
import {
    DocumentNode,
    DefinitionNode,
    OperationDefinitionNode,
    OperationTypeNode,
    SelectionSetNode,
    SelectionNode,
    FieldNode,
    parse, Kind
} from "graphql"

import {runQuery} from '../src/engine'
import {Query} from "ipfs-repo/dist/src/idstore";

const gqlqueryString = `
  query  { profile (filter: { 
    name: { ne: "mehdi" },
    age: { gt: 10 }
    }){
      name
      age
      }
    }  
`;

const gqlMutation=`
mutation profile(input:[{
    name:'keyvan'
    }]){
        _id
        name
    }
`;
const profile = [{
    key:'0',
    name: 'mahdi',
    age: 40,
},
{
    key:'1',
    name: 'keyvan',
    age: 30,
}, {
    key:'2',
    name: 'emad',
    age: 15,
}, {
    key:'3',
    name: 'ehsan',
    age: 35,
}, {
    key:'4',
    name: 'farhoud',
    age: 25,
}, {
    key:'5',
    name: 'mehdi',
    age: 30,
},
];
const expected={
    data:{
        profile
    },
    error:null
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

        const db = await orbitDB.docs('profile');
        await db.load();

        const promises = profile.map(obj => db.put({
            _id: obj.key,
            ...obj
        }));
        const addedList = await Promise.all(promises)
            .catch(error => t.fail(JSON.stringify(error)))
        console.log('addedList:',addedList);
        const gqlquery = parse(gqlqueryString)
        const defs = gqlquery.definitions.filter(def => def.operation === OperationTypeNode.QUERY);
        return runQuery(orbitDB,defs[0]);
    } catch (error) {
        t.error(error);
    }

    t.pass('OrbitDb doc done!!!');
    //Kill the main
    try {
        await graceful();
        t.end();
    } catch (error) {
        console.log('graceful', error);
    }

});
