import { GraphQLJSON,GraphQLJSONObject } from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';

import { getOrbitDb } from '../src/app';
import {_reGetFilter} from './engine/query'

const typeDefs = `
    scalar JSON
    scalar JSONObject
    input ReadInput {
        collection:String!
        filter:JSON
    }
    input CreateInput {
        collection:String!
        values:JSON!
    }
    input UpdateInput {
        collection:String!
        values:JSON!
    }
    input DeleteInput {
        collection:String!
        ids:[ID!]
    }
    type Query {
        read (input:ReadInput): [JSON]
    }
    type Mutation {
        create (input:CreateInput!):JSON!
        update (input:UpdateInput!):[JSON]
        delete (input:DeleteInput!):[ID!]
    }
`;

const typeResolvers = {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
};

export const schema = makeExecutableSchema({ typeDefs, resolvers:typeResolvers });

export const resolvers = {
    read: async ({input}:{input:{collection:string,filter:any}}) => {
        console.log("read",input);
        try {
            const orbitDB = await getOrbitDb();
            const db = await orbitDB.docs(input.collection);
            await db.load();
            // const result = db.get('');
            const result = db.query(_reGetFilter(input.filter))
            return result;
        } catch (error) {
            throw error;
        }
    },
    create: async ({input}:{input:{collection:string,values:any[]}})=>{
        console.log("create:",input);
        try {
            const orbitDB = await getOrbitDb();
            const db = await orbitDB.docs(input.collection);
            await db.load();
            const _values=input.values.map(value => ({
                _id: value.id,
                ...value
            }))
            const promises = _values.map(value => db.put({
                ...value
            }));
            const addedList = await Promise.all(promises);
            console.log('addedList',addedList);
            return _values;
            //return new Promise(resolve=>resolve(input.values));
        } catch (error) {
            throw error;
        }
    },
    // update: async (collection:string,values:any[])=>{
        
    // },
    remove: async ({input}:{input:{collection:string,ids:string[]}})=>{
        console.log("remove",input);
        try {
            const orbitDB = await getOrbitDb();
            const db = await orbitDB.docs(input.collection);
            await db.load();
            const promises = input.ids.map(id => db.del(id));
            const deletedList = await Promise.all(promises);
            console.log(deletedList)
            return input.ids;
        } catch (error) {
            throw error;
        }
    }
};