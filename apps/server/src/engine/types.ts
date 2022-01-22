export type Doc = Record<string, string | number>

export type CollectionName = string

export type Filter = (Object) => boolean

export type Fields = Array<string>

export type Atom = {
    name: {
        value: "ne" | "gt" | "gte" | "lt" | "lte" | "eq"
    },
    value: {
        value: string
    }
}

export type FilterField = {
    name: {
        value: string
    },
    value: {
        fields: Array<Atom>
    }
}

export enum FilterKeys {GT="gt", LT="lt", GTE="gte", LTE="lte", EQ="eq", NE="ne", IN="in", NIN="nin"}
export enum LogicalFilterKeys {AND="and", OR="or"}
export type FilterValues = string | number | Array<string | number>
export type FieldFilterValue = {
    [key in FilterKeys]?: FilterValues
}
export type FieldFilter = {
    [fieldName: string]: FieldFilterValue
}
export type AndOp = {
    "$and": Array<ReadInput>
}
export type OrOp = {
    "$or": Array<ReadInput>
}
export type ReadInput = AndOp | OrOp | FieldFilter 

export const isLogical = (op: string) => Object.values(LogicalFilterKeys).indexOf(op) >= 0
