import {
    PROTOCOL,
    handler,
    setQueryResolutionMethod,
    Result,
    Request,
    setSubscriptionQueryResolutionMethod
} from "@functionland/graph-protocol";
import {createResolver} from "./gql-engine/orbit/orbit-resolvers";
import {executeAndSelect} from "./gql-engine";
import {parse} from "graphql";
import {iterateLater, toAsyncIterable} from "async-later";
import {getDBCollections} from "../app";
import * as IPFS from 'ipfs';



export const registerGraph = async (libp2pNode ,orbitDBNode) => {
    libp2pNode.handle(PROTOCOL, handler);
    const resolvers = createResolver(orbitDBNode)


    const dbCollections = await getDBCollections()


    const options = {
        // Give write access to ourselves
        accessController: {
            write: ['*']
        }
    }

    const loadDB = async (dbName: string) => {
        if(dbCollections[dbName]){
            return dbCollections[dbName]
        }
        else {
            const db = await orbitDBNode.docs('public.'+dbName,options)
            await db.load()
            db.events.on('replicated', () => {console.log(`${dbName} replicated`)})
            db.events.on('peer', (peer) => {console.log(peer)} )
            dbCollections[dbName] = db
            return db
        }
    }

    setQueryResolutionMethod(async function (req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore

        const {query, variableValues, operationName} = Request.toJson(req)
        const gqlQuery = parse(query)
        const data = await executeAndSelect(gqlQuery, resolvers, variableValues, operationName, loadDB)
        const s = Result.fromJson(data)
        const bytes = Result.toBinary(s)
        return bytes && toAsyncIterable([bytes]);
    })

    setSubscriptionQueryResolutionMethod(async function* (req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore

        const {query, variableValues, operationName} = Request.toJson(req)
        const gqlQuery = parse(query)

        const [values, next, complete] = iterateLater()

        const data = await executeAndSelect(gqlQuery, resolvers, variableValues, operationName, loadDB, next, true)
        const s = Result.fromJson(data)
        const bytes = Result.toBinary(s)

        yield bytes

        for await (const res of values){
            const s = Result.fromJson(res)
            const bytes = Result.toBinary(s)

            yield bytes
        }
    })
}
