import {PROTOCOL, handler, setQueryResolutionMethod, Result, Request} from "@functionland/graph-protocol";
import {createResolver} from "./gql-engine/orbit/orbit-resolvers";
import {executeAndSelect} from "./gql-engine";
import {parse} from "graphql";
import {toAsyncIterable} from "async-later";

export const registerGraph = (libp2pNode, orbitDBNode) => {
    console.log('how fucked')
    libp2pNode.handle(PROTOCOL, handler);
    const resolvers = createResolver(orbitDBNode)
    setQueryResolutionMethod(async (req: Request) => {
        const {query, variableValues, operationName} = Request.toJson(req)
        const gqlQuery = parse(query)
        const data = await executeAndSelect(gqlQuery, resolvers, variableValues, operationName)
        const s = Result.fromJson(data)
        const bytes = Result.toBinary(s)
        return bytes && toAsyncIterable([bytes]);
    })
}
