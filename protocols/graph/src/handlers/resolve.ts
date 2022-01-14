import pipe from 'it-pipe';
import { MuxedStream } from 'libp2p';
import { Request, JSONResponse } from '../schema';
import { Response } from '../';
import { PROTOCOL } from '../constants';

type Resolve = ({query}: {query: string}) => Response;

const resolveNotSupported: Resolve = () => {
    throw new Error('This node does not support file content retrieval');
};

export let resolve = resolveNotSupported;

export function setQueryResolutionMethod(method: Resolve) {
    resolve = method;
}

export async function submitQuery({connection, query}: {
    connection: { stream: MuxedStream, protocol: string };
    query: string
}) {
    if (connection.protocol !== PROTOCOL) {
        throw new Error('Protocol mismatched')
    }
    const streamQuerySubmission = async function* () {
        yield Request.toBinary({ query });
    };

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const queryResult = await pipe(streamQuerySubmission, connection.stream, async function* (source: any) {
        for await (const message of source) {
            yield message.slice();
        }
    });
    for await (const result of queryResult) {
        return JSON.parse(JSONResponse.fromBinary(result).json);
    }
}
