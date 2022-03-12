import pipe from 'it-pipe';
import {MuxedStream} from 'libp2p';
import {Response} from '../';
import {PROTOCOL} from '../constants';
import {Request, Result} from "../schema/graph";

export type Resolve = (Request) => Response;
export type SubscriptionResolve = (Request) => AsyncIterable<Response>

const resolveNotSupported: Resolve = () => {
    throw new Error('This node does not support graphql');
};
const subscriptionResolveNotSupported: SubscriptionResolve = () => {
    throw new Error('This node does not support subscription over graphql')
}

export let resolve = resolveNotSupported;
export let subscriptionResolve = subscriptionResolveNotSupported;

export function setQueryResolutionMethod(method: Resolve) {
    resolve = method;
}

export function setSubscriptionQueryResolutionMethod(method: SubscriptionResolve) {
    subscriptionResolve = method
}

export async function submitQuery({connection, req}: {
    connection: { stream: MuxedStream, protocol: string };
    req: Request
}): Promise<Result | undefined> {
    if (connection.protocol !== PROTOCOL) {
        throw new Error('Protocol mismatched')
    }
    const streamQuerySubmission = async function* () {
        yield Request.toBinary(req);
    };

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const queryResult = await pipe(streamQuerySubmission, connection.stream, async function* (source: any) {
        for await (const message of source) {
            yield message.slice();
        }
    });
    for await (const result of queryResult) {
        return Result.fromBinary(result);
    }
}

export async function* submitSubscriptionQuery({connection, req}: {
    connection: { stream: MuxedStream, protocol: string };
    req: Request
}): AsyncIterable<Result | undefined> {
    if (connection.protocol !== PROTOCOL) {
        throw new Error('Protocol mismatched')
    }
    const streamQuerySubmission = async function* () {
        yield Request.toBinary(req);
    };

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const queryResult = await pipe(streamQuerySubmission, connection.stream, async function* (source: any) {
        for await (const message of source) {
            yield message.slice();
        }
    });
    for await (const result of queryResult) {
        yield  Result.fromBinary(result);
    }
}
