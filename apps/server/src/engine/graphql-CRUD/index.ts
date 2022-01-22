import { GraphQLJSON, GraphQLJSONObject } from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';
import { getOrbitDb } from '../../../src/app';
import { _reGetFilter, selector } from '../query';
import {execute, Document, GraphQLSchema} from 'graphql'


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
    input UpdateQueryInput {
        collection:String!
        value:JSON!,
        filter:JSON
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
        updateQuery (input:UpdateQueryInput!):[JSON]
        delete (input:DeleteInput!):[ID!]
    }
`;

const typeResolvers = {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
};

export const crudSchema = makeExecutableSchema({ typeDefs, resolvers: typeResolvers });

export type ReadArgs = {
    input: {
        collection: string,
        filter: any
    }
}
export type CreateArgs = {
    input: {
        collection: string,
        values: any[]
    }
}
export type UpdateArgs = {
    input: {
        collection: string,
        values: any[]
    }
}
export type UpdateQueryArgs = {
    input: {
        collection: string,
        value: any,
        filter: any
    }
}
export type DeleteArgs = {
    input: {
        collection: string,
        ids: any[]
    }
}
export const read = async (args: ReadArgs) => {
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        const result = db.query(_reGetFilter(args.input.filter))
        return result;
    } catch (error) {
        throw error;
    }
}
export const create = async (args: CreateArgs) => {
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        // TODO: generate uuid and asign to _id, if value.id is not presented
        const _values = args.input.values.map(value => ({
            _id: value.id,
            ...value
        }))
        const promises = _values.map(value => db.put({
            ...value
        }));
        await Promise.all(promises);
        return _values;
        //return new Promise(resolve=>resolve(input.values));
    } catch (error) {
        throw error;
    }
}
export const update = async (args: UpdateArgs) => {
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        // TODO: generate uuid and asign to _id, if value.id is not presented
        const _values = args.input.values.map(value => ({
            _id: value.id,
            ...value
        }))
        const promises = _values.map(value => db.put({
            ...value
        }));
        await Promise.all(promises);
        return _values;
        //return new Promise(resolve=>resolve(input.values));
    } catch (error) {
        throw error;
    }
}
export const updateQuery = async (args: UpdateQueryArgs) => {
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        const result = db.query(_reGetFilter(args.input.filter))
        // TODO: generate uuid and asign to _id, if value.id is not presented
        const _values = result.map(currentValue => ({
            ...currentValue,
            ...args.input.value
        }))
        const promises = _values.map(value => db.put({
            ...value
        }));
        const addedList = await Promise.all(promises);
        // console.log('updateQueryList', addedList);
        return _values;
        //return new Promise(resolve=>resolve(input.values));
    } catch (error) {
        throw error;
    }
}
export const remove = async (args: DeleteArgs) => {
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        const promises = args.input.ids.map(id => db.del(id));
        await Promise.all(promises);
        return args.input.ids
    } catch (error) {
        throw error;
    }
}

export interface IResolvers {
    read?: Function
    create?: Function
    update?: Function
    updateQuery?: Function
    delete?: Function
}

export const crudResolvers: IResolvers = {
    read,
    create,
    update,
    updateQuery,
    delete: remove
};

export const executeAndSelect = async (query: Document, schema: GraphQLSchema=crudSchema, resolvers: IResolvers=crudResolvers) => {

        const res= await execute({
            schema,
            document:query, 
            rootValue:resolvers});
        
        const defs = query.definitions

        let resSelected = {}
        Object.keys(res.data).forEach(key => {
            resSelected[key] = selector(res.data[key], defs[0])
        })
        return {
            data: resSelected
        }

}