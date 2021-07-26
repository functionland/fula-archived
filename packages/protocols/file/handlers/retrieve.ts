import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { Request, Chunk } from '../schema';
import { Response } from '.';
import { PROTOCOL } from '../constants';

type Retrieve = ({ id, skip, limit }: Chunk) => Response;

const retrieveNotSupported: Retrieve = () => {
  throw new Error('This node does not support file content retrieval');
};

export let retrieve = retrieveNotSupported;

export function setContentRetrievalMethod(method: Retrieve) {
  retrieve = method;
}

export async function* receiveContent({
  from,
  node,
  id,
  skip,
  limit,
}: {
  from: PeerId;
  node: Libp2p;
  id: string;
  skip?: bigint;
  limit?: bigint;
}): AsyncIterable<Uint8Array> {
  const streamReceiveFileContent = async function* () {
    yield Request.toBinary({
      type: {
        oneofKind: 'receive',
        receive: { id, skip, limit },
      },
    });
  };

  const { stream } = await node.dialProtocol(from, PROTOCOL);

  const chunks = await pipe(streamReceiveFileContent, stream, async function* (source) {
    for await (const message of source) {
      yield message.slice();
    }
  });
  for await (const chunk of chunks) {
    yield chunk;
  }
}
