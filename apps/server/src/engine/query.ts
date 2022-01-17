import {
    OperationDefinitionNode,
    OperationTypeNode,
    FieldNode,
    ObjectValue,
    ObjectField
} from "graphql"
import {CollectionName, Doc, Fields, Filter, FilterField} from "./types";

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

export const getCollection = (def: OperationDefinitionNode): CollectionName => (def.selectionSet.selections[0] as FieldNode).name.value

export const reGetFilter = (rootNode: ObjectField): Filter => {
    const isLeaf = (node: ObjectField): boolean => node.value.kind === 'ObjectValue'

    // check if node is a leaf
    if(isLeaf(rootNode)) return evaluate(rootNode)

    // the node is not leaf
    // return recursively
    const nodeLabel = rootNode.name.value

    // children filters for 'or'/'and' may be an ObjectValue insted of ListValue
    // since the evaluation of 'or'/'and' operators with just one argument is unnecessary, we only consider ListValue
    const childrenNodes = rootNode.value.values
    switch (nodeLabel){
        case 'or':
            return (doc) => childrenNodes.map(node => node.fields[0]).reduce((prev, curr) => prev || reGetFilter(curr)(doc), false)
        case 'and':
            return (doc) => childrenNodes.map(node => node.fields[0]).reduce((prev, curr) => prev && reGetFilter(curr)(doc), true)
        default:
            throw `Not implemented AST node ${nodeLabel}`
    }
}

export const getFilter = (def: OperationDefinitionNode): Filter => {

    const fields = def.selectionSet.selections[0].arguments[0].value.fields
    let filter
    if(fields.length === 1)
        filter = reGetFilter(fields[0])
    else if (fields.length > 1)
        filter = (doc: Doc) => fields.reduce((prev, curr) => prev && reGetFilter(curr)(doc), true)

    return filter
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
