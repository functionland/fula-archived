import {
    OperationDefinitionNode,
    OperationTypeNode,
    FieldNode,
    ObjectValue,
    ObjectField
} from "graphql"
import {CollectionName, Doc, Fields, Filter, FilterField, ReadInput, FieldFilter, LogicalFilterKeys, FilterKeys} from "./types";

const evaluate = (leaf: FieldFilter) => {

    const partialFieldFilters = Object.entries(leaf)
    const partailEvals = partialFieldFilters.map(([fieldName, atom]) => (doc: Doc) => {
        // multiple field operators e.g: {$gt: 10, $lt: 30}
        const ops = Object.entries(atom)
        return ops.reduce((prev, curr) => {
            const [op, value] = curr

            if(!value)
                throw `bad query`
            
            switch (op) {
                case "__ne":
                    return prev && doc[fieldName] != value
                case "__gt":
                    return prev && doc[fieldName] > value
                case "__lt":
                    return prev && doc[fieldName] < value
                case "__gte":
                    return prev && doc[fieldName] >= value
                case "__lte":
                    return prev && doc[fieldName] <= value
                case "__eq":
                    return prev && doc[fieldName] == value
                default:
                    throw `Not implemented operator ${op}`
            }
        }, true)
        
    })

    return (doc: Doc) => partailEvals.reduce((prev, curr) => prev && curr(doc), true)
}

export const getCollection = (def: OperationDefinitionNode): CollectionName => (def.selectionSet.selections[0] as FieldNode).name.value

export const _reGetFilter = (rootNode: ReadInput): Filter => {
    const isLeaf = (node: ReadInput): boolean => Object.keys(node).map(key => !key.startsWith("__")).reduce((prev, curr) => prev && curr, true)

    // check if node is a leaf
    if(isLeaf(rootNode)) return evaluate(rootNode as FieldFilter)

    // the node is not a leaf
    // return recursively
    
    // find root operator
    const op = Object.keys(rootNode).filter(key => key.startsWith("__"))[0]
    const childrenNodes = rootNode[op]
    
    switch (op){
        case "__or":
            return (doc) => childrenNodes.reduce((prev, curr) => prev || _reGetFilter(curr)(doc), false)
        case "__and":
            return (doc) => childrenNodes.reduce((prev, curr) => prev && _reGetFilter(curr)(doc), true)
        default:
                throw `Not implemented operator ${op}`
    }
}

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
