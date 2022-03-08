import { pipe } from 'it-pipe';
import type * as it from 'it-stream-types';
import { MuxedStream } from 'libp2p';
import {Response} from '../';
import { PROTOCOL } from '../constants';
import {Request, Result} from "../schema";

export type Resolve = (rq:Request) => Response;

const resolveNotSupported: Resolve = () => {
    throw new Error('This node does not support graphql');
};

export let resolve = resolveNotSupported;

export function setQueryResolutionMethod(method: Resolve) {
    resolve = method;
}

export async function submitQuery({connection, req}: {
    connection: { stream: MuxedStream, protocol: string };
    req: Request
}): Promise<Result|undefined> {
    if (connection.protocol !== PROTOCOL) {
        throw new Error('Protocol mismatched')
    }
    const streamQuerySubmission = async function* () {
        yield Request.toBinary(req);
    };

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const queryResult = await pipe(streamQuerySubmission, connection.stream as it.Duplex<any>, async function* (source: any) {
        for await (const message of source) {
            yield message.slice();
        }
    });
    for await (const result of queryResult) {
        return Result.fromBinary(result);
    }
}
