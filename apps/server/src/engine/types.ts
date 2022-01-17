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
