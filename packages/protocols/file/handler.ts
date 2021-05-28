import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import {encode, decode} from '@ipld/dag-json';
import { ProtocolHandler } from '..';
import BufferList from 'bl/BufferList';

const PROTOCOL = 'fx/file/0.1.0';

interface MetaBase {
  name: string;
  size: number;
  lastModified: number;
}

interface FileStream<Meta = MetaBase> {
  meta: Meta;
  stream(): AsyncIterable<Uint8Array>;
}

const states = {
  META: `${PROTOCOL}/end`,
  DATA: `${PROTOCOL}/meta`,
  END: `${PROTOCOL}/meta`
}

export const handleFile: ProtocolHandler = async ({stream}) => {
  let queue = [
    states.META,
    states.END,
    states.DATA,
    states.END
  ];
  let meta;
  await pipe(
    stream,
    async function (source) {
      for await (const message of source) {
        const [state, ...queueRest] = queue;
        if (String(message) === state) {
          queue = queueRest;
          continue;
        }
        switch (state) {
          case states.META:
            console.log(BufferList.isBufferList(message));
            meta = decode(message as Uint8Array);
            break;
          case states.DATA:
            console.log(message);
            break;
          default:
            throw new Error(`stream not adhering to ${PROTOCOL} protocol`);
        }
      }
    }
  )
  await pipe(['done'], stream)
  await pipe([], stream)
}

export async function sendFile({to, node, file}: {to: PeerId, node: Libp2p, file: File}) {
  const size = file.size;
  const name = file.name;
  const meta = encode({size, name});
  console.log(meta);
  const getFileAsAsyncIterable = async function * () {
    yield '/meta';
    yield meta;
    yield '/end';
    yield '/data';
    const reader = file.stream().getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
    yield '/end';
  }
    const { stream } = await node.dialProtocol(to, PROTOCOL);
    await pipe(
      () => getFileAsAsyncIterable(),
      stream,
      async function (source) {
        for await (const message of source) {
          console.info(String(message) + 'weee')
        }
      }
    );
    console.log('sent')
}
