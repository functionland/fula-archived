//Parse Query and Select What to do with Document Node
import { getOrbitDb } from '../../src/app';
import { _reGetFilter } from './query'

type ReadArgs = {
    input: {
        collection: string,
        filter: any
    }
}
type CreateArgs = {
    input: {
        collection: string,
        values: any[]
    }
}
type UpdateArgs = {
    input: {
        collection: string,
        values: any[]
    }
}
type UpdateQueryArgs = {
    input: {
        collection: string,
        value: any,
        filter:any
    }
}
type RemoveArgs = {
    input: {
        collection: string,
        ids: any[]
    }
}
export const read = async (args: ReadArgs) => {
    console.log("read", args.input);
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        // const result = db.get('');
        const result = db.query(_reGetFilter(args.input.filter))
        return result;
    } catch (error) {
        throw error;
    }
}
export const create = async (args: CreateArgs) => {
    console.log("create:", args.input);
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        // TODO: generate uuid and asign to _id, if value.id is not presented
        const _values = args.input.values.map(value => ({
            _id: value.id,
            ...value
        }))
        const promises = _values.map(value => db.put({
            ...value
        }));
        const addedList = await Promise.all(promises);
        console.log('addedList', addedList);
        return _values;
        //return new Promise(resolve=>resolve(input.values));
    } catch (error) {
        throw error;
    }
}
export const update = async (args: UpdateArgs) => {
    console.log("create:", args.input);
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        // TODO: generate uuid and asign to _id, if value.id is not presented
        const _values = args.input.values.map(value => ({
            _id: value.id,
            ...value
        }))
        const promises = _values.map(value => db.put({
            ...value
        }));
        const addedList = await Promise.all(promises);
        console.log('addedList', addedList);
        return _values;
        //return new Promise(resolve=>resolve(input.values));
    } catch (error) {
        throw error;
    }
}
export const updateQuery = async (args: UpdateQueryArgs) => {
    console.log("create:", args.input);
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        const result = db.query(_reGetFilter(args.input.filter))
        // TODO: generate uuid and asign to _id, if value.id is not presented
        const _values = result.map(currentValue => ({
            ...currentValue,
            ...args.input.value
        }))
        const promises = _values.map(value => db.put({
            ...value
        }));
        const addedList = await Promise.all(promises);
        console.log('updateQueryList', addedList);
        return _values;
        //return new Promise(resolve=>resolve(input.values));
    } catch (error) {
        throw error;
    }
}
export const remove = async (args: RemoveArgs) => {
    console.log("remove", args.input);
    try {
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(args.input.collection);
        await db.load();
        const promises = args.input.ids.map(id => db.del(id));
        const deletedList = await Promise.all(promises);
        console.log(deletedList)
        return args.input.ids;
    } catch (error) {
        throw error;
    }
}