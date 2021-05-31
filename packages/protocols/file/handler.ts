import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { ProtocolHandler } from '..';
import { PROTOCOL } from './constants';

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
  META: `${PROTOCOL}/meta`,
  DATA: `${PROTOCOL}/data`,
  END: `${PROTOCOL}/end`
}

function equals(message: Buffer | Uint8Array, state: string) {
  const stateBytes = new TextEncoder().encode(state);
  for (let i = 0; i < stateBytes.length; i++) {
    if (stateBytes[i] !== message[i]) {
      return false;
    }
  }
  return true;
}

export const handleFile: ProtocolHandler = async ({stream}) => {
  let meta;
  await pipe(
    stream,
    async function (source) {
      let queue = [
        states.META,
        states.END,
        states.DATA,
        states.END
      ];
      for await (const message of source) {
        const [state, endState, ...queueRest] = queue;
        console.log(queue)
        if (equals(message.slice(), state)) {
          continue;
        }
        if (equals(message.slice(), endState)) {
          queue = queueRest;
          continue;
        }
        switch (state) {
          case states.META:
            console.log('meta')
            meta = JSON.parse(String(message));
            console.log(meta)
            break;
          case states.DATA:
            console.log('data');
            break;
          default:
            throw new Error(`stream not adhering to ${PROTOCOL} protocol,
              message "${String(message)}" not recognized.`);
        }
      }
      if (queue.length > 0) {
        throw new Error(`stream not adhering to ${PROTOCOL} protocol,
          parse queue [${queue}] not empty at the end of the stream.`);
      }
    }
  )
  await pipe(['done'], stream)
  await pipe([], stream)
}

export async function sendFile({to, node, file}: {to: PeerId, node: Libp2p, file: File}) {
  const {size, name, lastModified} = file;
  const meta = JSON.stringify({size, name, lastModified});
  console.log(meta);
  const getFileAsAsyncIterable = async function * () {
    yield states.META;
    yield meta;
    yield states.END;
    yield states.DATA;
    const reader = file.stream().getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
    yield states.END;
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
