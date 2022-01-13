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
    FieldNode
} from "graphql/language/ast"

const gqlquery: DocumentNode = gql`
    query {
        profile{
        name
        
    }
}`;
const gqlqueryFilter: DocumentNode = gql`
    query profile(where:{
        and:[{
            age:{gt:10}
        },{
            age:{lt:30}
        }]
    }){
        name
        
    }`;
const gqlMutation:DocumentNode=gql`
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
async function runQuery(orbitDB: any, _def: DefinitionNode) {
    const def=(_def as OperationDefinitionNode);
    if (def.operation !== OperationTypeNode.QUERY)
        throw 'operation is not query';
    const db = await orbitDB.docs(def.name?.value);
    await db.load();
    const result: [] = db.get('');

    const data=result.map(row => {
        return def.selectionSet.selections.map((selection: SelectionNode) => {
            console.log('selection:',selection)
            return {
                field: (selection as FieldNode).name.value,
                value: row[`${(selection as FieldNode).name.value}`]
            }
        })
    });
    return {
        [`${def.name?.value}`]: data.map(row=>{
            return row.reduce((obj,item)=>{
                //ts-ingnore
                obj[`${item.field}`]=item.value;
                return obj;
            },{})
        })
    }
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

        const gqlResult=await Promise.all(gqlquery.definitions.map(def => {
            return runQuery(orbitDB,def);
        }));
        console.log("gqlResult",JSON.stringify(gqlResult,null,2));

        
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
        console.log('graceful', error);
    }

});