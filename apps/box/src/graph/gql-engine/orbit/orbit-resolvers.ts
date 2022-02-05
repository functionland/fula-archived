import {_reGetFilter} from "./orbit-filter";
import {CreateArgs, DeleteArgs, IResolvers, ReadArgs, UpdateArgs, UpdateQueryArgs} from "../types";


export const createResolver = (orbitDB): IResolvers => {
    const _orbitDB = orbitDB

    const load = async (name) => {
        const db = await _orbitDB.docs(name);
        await db.load();
        return db
    }
    return {
        read: async (args: ReadArgs) => {
            const db = await load(args.input.collection)
            return db.query(_reGetFilter(args.input.filter));
        },
        create: async (args: CreateArgs) => {
            const db = await load(args.input.collection)
            // TODO: generate uuid and asign to _id, if value.id is not presented
            const _values = args.input.values.map(value => ({
                _id: value.id,
                ...value
            }))
            const promises = _values.map(value => db.put({
                ...value
            }));
            await Promise.all(promises);
            return _values;
        },
        update: async (args: UpdateArgs) => {
            const db = await load(args.input.collection)
            // TODO: generate uuid and asign to _id, if value.id is not presented
            const _values = args.input.values.map(value => ({
                _id: value.id,
                ...value
            }))
            const promises = _values.map(value => db.put({
                ...value
            }));
            await Promise.all(promises);
            return _values;

        },
        updateQuery: async (args: UpdateQueryArgs) => {
            const db = await load(args.input.collection)
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
            return _values;

        },
        delete: async (args: DeleteArgs) => {
            const db = await load(args.input.collection)
            const promises = args.input.ids.map(id => db.del(id));
            await Promise.all(promises);
            return args.input.ids
        }
    }

}
