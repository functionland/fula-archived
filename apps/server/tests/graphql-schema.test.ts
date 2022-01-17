import test from 'tape';
import { main, graceful, getLibp2p, getIPFS, getOrbitDb } from '../src/app';
import gql from 'graphql-tag';
import { graphql, buildSchema,execute,GraphQLObjectType } from 'graphql'
import { GraphQLJSON,GraphQLJSONObject } from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';
import {schema,resolvers} from '../../server/src/graphql'

test('Simple execute graphgql test', async function (t) {
    const typeDefs = `
    scalar JSON
    scalar JSONObject
    type Query {
        hello (input:JSON): [JSON]
    }
    `;
    
    const resolvers = {
      JSON: GraphQLJSON,
      JSONObject: GraphQLJSONObject,
    };
    
    let schema = makeExecutableSchema({ typeDefs, resolvers });
   
    // The root provides a resolver function for each API endpoint
    let root = {
        hello: async (input) => {
            console.log("input",JSON.stringify(input))
            return await new Promise(resolve => resolve(
                // [[{
                //     field:'words',
                //     value:'Hello world!'}]]
                [{words:'Hello world!'}]
                ));
        },
    };

    try {
       
        const docNode=gql`query {hello(input:{key:{eq:"value"}})}`;
        const  response= await execute({
            schema,
            document:docNode , 
            rootValue:root});
        console.log("graphql:", JSON.stringify(response));

    } catch (error) {
        console.log("error", error)
    }
});

test('Graphgql on OrbitDB test', async function (t) {

    try {
        main().catch((e) => {
            t.fail(e);
        });
        const node = await getLibp2p();
        const ipfs = await getIPFS();
        
        // const create=gql`
        //     mutation {
        //         create(input:{
        //             collection:"profile",
        //             values:[{id:1,name:"mahdi"},{id:2,name:"ehsan"}]
        //         }){
        //             id
                    
        //         }
        //     }`;
        // const  response= await execute({
        //     schema,
        //     document:create , 
        //     rootValue:resolvers});
        // console.log("create:", JSON.stringify(response));

        const read=gql`
            query {
                read (input:{
                    collection:"profile"
                }){
                    id
                }
            }`;
        const  readResponse= await execute({
            schema,
            document:read , 
            rootValue:resolvers});
        console.log("read:", JSON.stringify(readResponse));

    } catch (error) {
        console.log("error", error)
    }
});
