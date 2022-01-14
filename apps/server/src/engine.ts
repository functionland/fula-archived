import {
    DocumentNode,
    DefinitionNode,
    OperationDefinitionNode,
    OperationTypeNode,
    SelectionNode,
    FieldNode
} from "graphql/language/ast"

type GQL_AST = any

type CollectionName = string

type Filter = (Object) => boolean 

type Fields = Array<string>

export const getCollection = (def: DefinitionNode): CollectionName => def.name?.value

export const getFilter = (def: DefinitionNode): Filter => {
    const evaluate = (atom: Atom, fieldName: string) => {
        return (doc: Object) => {
            switch(atom.name.value){
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
            }
        }
    }

    const filterFields: Array<FilterField> = def.selectionSet.selections[0].arguments[0].value.fields

    return (doc: Object) => {
        const parialResults = filterFields.map((field) => evaluate(field.value.fields[0].value, field.name.value)(doc))
        return parialResults.reduce((p, c) => p && c, false) || false
    }
}
// value: Object
//     kind: "ObjectValue"
//     fields: Array (1 item)
//     0: Object
//         kind: "ObjectField"
//         name: Object {kind: "Name", value: "ne"}
//         value: Object
//             kind: "StringValue"
//             value: "mehdi"
//             block: false

export const getFields = (gqlAST: DocumentNode): Fields => {}

export async function runQuery(orbitDB: any, gqlAST: DocumentNode) {
    console.log("GQLAST", gqlAST)
    const def=(gqlAST.definitions[0] as OperationDefinitionNode);
    if (def.operation !== OperationTypeNode.QUERY)
        throw 'operation is not query';
    
    // load orbitDB collection
    const collectionName = getCollection(def)
    const db = await orbitDB.docs(collectionName);
    await db.load();


    // const result: [] = db.get('');
    const result = db.query(getFilter(def))

    const data=result.map(row => {
        return def.selectionSet.selections.map((selection: SelectionNode) => {
            return {
                field: (selection as FieldNode).name.value,
                value: row[`${(selection as FieldNode).name.value}`]
            }
        })
    });
    return {
        [`${def.name?.value}`]: data.map(row=>{
            return row.reduce((obj,item)=>{
                //ts-ingnore
                obj[`${item.field}`]=item.value;
                return obj;
            },{})
        })
    }
}