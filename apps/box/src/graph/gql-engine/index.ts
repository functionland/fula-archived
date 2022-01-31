import {execute, DocumentNode, OperationDefinitionNode} from 'graphql'
import {Fields, IResolvers} from "./types";
import {schema} from "./schema";
import {Maybe} from "graphql/jsutils/Maybe";

export const getFields = (def: OperationDefinitionNode): Fields => {
    return def.selectionSet.selections[0].selectionSet.selections.map(node => node.name.value)
}

const selector = (res, def) => {
    const resSelected = {}
    Object.keys(res.data).forEach(key => {
        resSelected[key] = res.data[key].map(item => {
            if (typeof item !== 'object')
                return item
            return getFields(def)
                .filter(key => key in item)
                .reduce((obj2, key) => {
                    obj2[key] = item[key];
                    return obj2
                }, {});
        })
    })
    return {
        data: resSelected
    }
}

export const executeAndSelect = async (
    query: DocumentNode,
    resolvers: IResolvers,
    variableValues: Maybe<{ [p: string]: unknown }>,
    operationName: Maybe<string>
) => {
    const res = await execute({
        operationName,
        variableValues,
        schema,
        document: query,
        rootValue: resolvers
    });
    const def = query.definitions[0]
    return selector(res, def)
}
