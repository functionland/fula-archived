import { GraphQLJSON, GraphQLJSONObject } from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';

import { getOrbitDb } from '../src/app';
import { _reGetFilter } from './engine/query'
import { create, read, update, updateQuery, remove } from './engine'
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

export const schema = makeExecutableSchema({ typeDefs, resolvers: typeResolvers });

export const resolvers = {
    read,
    create,
    update,
    updateQuery,
    remove
};