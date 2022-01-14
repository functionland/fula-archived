import {
    DefinitionNode,
    OperationDefinitionNode,
    OperationTypeNode,
    SelectionNode,
    FieldNode
} from "graphql/language/ast"

export async function runQuery(orbitDB: any, _def: DefinitionNode) {
    const def=(_def as OperationDefinitionNode);
    if (def.operation !== OperationTypeNode.QUERY)
        throw 'operation is not query';
    const db = await orbitDB.docs(def.name?.value);
    await db.load();
    const result: [] = db.get('');

    const data=result.map(row => {
        return def.selectionSet.selections.map((selection: SelectionNode) => {
            console.log('selection:',selection)
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