import pipe from 'it-pipe';
import Libp2p, {MuxedStream} from 'libp2p';
import PeerId from 'peer-id';
import {Request, Chunk} from '../schema';
import {Response} from '../';
import {PROTOCOL} from '../constants';

type Retrieve = ({id, skip, limit}: Chunk) => Response;

const retrieveNotSupported: Retrieve = () => {
    throw new Error('This node does not support file content retrieval');
};

export let retrieve = retrieveNotSupported;

export function setContentRetrievalMethod(method: Retrieve) {
    retrieve = method;
}

export async function* receiveContent({connection, id, skip, limit}: {
    connection: { stream: MuxedStream, protocol: string };
    id: string;
    skip?: number;
    limit?: number;
}): AsyncIterable<Uint8Array> {
    if (connection.protocol !== PROTOCOL) {
        throw new Error('Protocol mismatched')
    }
    const streamReceiveFileContent = async function* () {
        yield Request.toBinary({
            type: {
                oneofKind: 'receive',
                receive: {id, skip, limit},
            },
        });
    };

    const chunks = await pipe(streamReceiveFileContent, connection.stream, async function* (source: any) {
        for await (const message of source) {
            yield message.slice();
        }
    });
    for await (const chunk of chunks) {
        yield chunk;
    }
}
