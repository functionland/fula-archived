import {
    Doc,
    Filter,
    ReadInput,
    FieldFilter,
    LogicalFilterKeys,
    FilterKeys,
    isLogical
} from "../types";

const evaluate = (leaf: FieldFilter) => {
    const partialFieldFilters = Object.entries(leaf)
    const partailEvals = partialFieldFilters.map(([fieldName, atom]) => (doc: Doc) => {
        // multiple field operators e.g: {$gt: 10, $lt: 30}
        const ops = Object.entries(atom)
        return ops.reduce((prev, curr) => {
            const [op, value] = curr

            if (!value)
                throw `bad query`

            switch (op) {
                case FilterKeys.NE:
                    return prev && doc[fieldName] != value
                case FilterKeys.GT:
                    return prev && doc[fieldName] > value
                case FilterKeys.LT:
                    return prev && doc[fieldName] < value
                case FilterKeys.GTE:
                    return prev && doc[fieldName] >= value
                case FilterKeys.LTE:
                    return prev && doc[fieldName] <= value
                case FilterKeys.EQ:
                    return prev && doc[fieldName] == value
                case FilterKeys.IN:
                    return typeof value === "object" && prev && value.indexOf(doc[fieldName]) >= 0
                case FilterKeys.NIN:
                    return typeof value === "object" && prev && value.indexOf(doc[fieldName]) < 0
                default:
                    throw `Not implemented operator ${op}`
            }
        }, true)

    })
    return (doc: Doc) => partailEvals.map(pe => pe(doc)).every(Boolean)
}


export const _reGetFilter = (rootNode: ReadInput): Filter => {
    if (Object.keys(rootNode).length === 0)
        return (doc) => true

    const isLeaf = (node: ReadInput): boolean => Object.keys(node).map(key => !isLogical(key)).some(Boolean)

    // check if node is a leaf
    if (isLeaf(rootNode)) return evaluate(rootNode as FieldFilter)

    // the node is not a leaf
    // return recursively

    // find root operator
    const op = Object.keys(rootNode).filter(key => isLogical(key))[0]
    const childrenNodes = rootNode[op]

    switch (op) {
        case LogicalFilterKeys.OR:
            return (doc) => childrenNodes.map(node => _reGetFilter(node)(doc)).some(Boolean)
        case LogicalFilterKeys.AND:
            return (doc) => childrenNodes.map(node => _reGetFilter(node)(doc)).every(Boolean)
        default:
            throw `Not implemented operator ${op}`
    }
}

