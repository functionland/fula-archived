import {
    OperationDefinitionNode,
    OperationTypeNode,
    FieldNode
} from "graphql"
import {CollectionName, Doc, Fields, Filter, FilterField} from "./types";



export const getCollection = (def: OperationDefinitionNode): CollectionName => (def.selectionSet.selections[0] as FieldNode).name.value

export const getFilter = (def: OperationDefinitionNode): Filter => {
    const evaluate = (field) => {
        const fieldName = field.name.value
        const atom = field.value.fields[0]
        return (doc: Doc) => {
            switch (atom.name.value) {
                case "ne":
                    return doc[fieldName] != atom.value.value
                case "gt":
                    return doc[fieldName] > atom.value.value
                case "lt":
                    return doc[fieldName] < atom.value.value
                case "gte":
                    return doc[fieldName] >= atom.value.value
                case "lte":
                    return doc[fieldName] <= atom.value.value
                case "eq":
                    return doc[fieldName] == atom.value.value
                default:
                    throw `Not implemented operator ${atom.name.value}`
            }
        }
    }

    const filterFields: Array<FilterField> = def.selectionSet.selections[0].arguments[0].value.fields

    return (doc: Doc) => {
        const partialResults = filterFields.map((field) => evaluate(field)(doc))
        return partialResults.reduce((p, c) => p && c, true) || false
    }
}

export const getFields = (def: OperationDefinitionNode): Fields => {
    return def.selectionSet.selections[0].selectionSet.selections.map(node => node.name.value)
}

export const selector = (res, def) => {
    return res.map(item => {
        return getFields(def)
            .filter(key => key in item)
            .reduce((obj2, key) => {obj2[key] = item[key]; return  obj2},{});
    })

}

export async function runQuery(orbitDB: any, def: OperationDefinitionNode) {
    if (def.operation !== OperationTypeNode.QUERY)
        throw 'operation is not query';

    const collectionName = getCollection(def)
    const db = await orbitDB.docs(collectionName);
    await db.load();
    const res = db.query(getFilter(def))
    const subsetRes = selector(res,def)

    return {
        [collectionName]:subsetRes
    }
}
