import pipe from 'it-pipe';
// @ts-ignore
import Libp2p, {MuxedStream} from 'libp2p';
// @ts-ignore
import PeerId from 'peer-id';
import {toAsyncIterable} from 'async-later';
import {Request, Meta} from '../schema';
import {Response} from '../';
import {PROTOCOL} from '../constants';

type GetMeta = ({id}: { id: string }) => Response;

const getMetaNotSupported: GetMeta = () => {
    throw new Error('This node does not support file meta retrieval');
};

export let getMeta = getMetaNotSupported;

export function setMetaRetrievalMethod(method: ({id}: { id: string }) => Promise<Meta | undefined>) {
    getMeta = async ({id}) => {
        const meta = await method({id});
        const binary = meta && Meta.toBinary(meta);
        return binary && toAsyncIterable([binary]);
    };
}

export async function receiveMeta({connection, id,}: {
    connection: { stream: MuxedStream, protocol: string };
    id: string;
}): Promise<Meta> {
    if (connection.protocol !== PROTOCOL) {
        throw Error('Protocol mismatched')
    }
    const streamReceiveFileMeta = async function* () {
        yield Request.toBinary({
            type: {
                oneofKind: 'meta',
                meta: id,
            },
        });
    };


    return pipe(streamReceiveFileMeta, connection.stream, async function (source: any) {
        for await (const message of source) {
            return Meta.fromBinary(message.slice());
        }
    });


}
