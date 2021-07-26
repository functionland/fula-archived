import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { Request, Meta } from '../schema';
import { Response } from '.';
import { PROTOCOL } from '../constants';
import { toAsyncIterable } from '../../util';

type GetMeta = ({ id }: { id: string }) => Response;

const getMetaNotSupported: GetMeta = () => {
  throw new Error('This node does not support file meta retrieval');
};

export let getMeta = getMetaNotSupported;

export function setMetaRetrievalMethod(
  method: ({ id }: { id: string }) => Promise<Meta | undefined>
) {
  getMeta = async ({ id }) => {
    const meta = await method({ id });
    const binary = meta && Meta.toBinary(meta);
    return binary && toAsyncIterable(binary);
  };
}

export async function receiveMeta({
  from,
  node,
  id,
}: {
  from: PeerId;
  node: Libp2p;
  id: string;
}): Promise<Meta> {
  const streamReceiveFileMeta = async function* () {
    yield Request.toBinary({
      type: {
        oneofKind: 'meta',
        meta: id,
      },
    });
  };

  const { stream } = await node.dialProtocol(from, PROTOCOL);

  return pipe(streamReceiveFileMeta, stream, async function (source) {
    for await (const message of source) {
      return Meta.fromBinary(message.slice());
    }
  });
}
