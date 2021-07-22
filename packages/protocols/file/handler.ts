import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { ProtocolHandler } from '..';
import { PROTOCOL } from './constants';
import { deflate } from 'pako';
import { Request, Meta, Chunk } from './schema';
import { Subject } from 'rxjs';
import { resolveLater, partition, toAsyncIterable } from '../util';
import { map, consume, pipeline } from 'streaming-iterables';

interface Streamer extends AsyncIterable<Uint8Array> {
  pause(): void;
  resume(): void;
  jumpTo(skip: number);
}

interface FileStream {
  read(): Promise<Uint8Array>;
  stream(skip?: number): Streamer;
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

type HandleSend = ({
  Id,
  skip,
  limit,
}: Chunk) => Promise<AsyncIterable<Uint8Array> | undefined>;

const handleSendNotSupported: HandleSend = () => {
  throw new Error('This node does not support send file operation');
};

let handleSend = handleSendNotSupported;

export function setHandleSend(handler: HandleSend) {
  handleSend = handler;
}

export const incomingFiles = new Subject<{
  meta: Meta;
  content: Subject<Uint8Array>;
  declareId(_id: string): void;
}>();

const emptyResponse = toAsyncIterable(Promise.resolve('Empty response'));

export const handleFile: ProtocolHandler = async ({ stream }) => {
  const content = new Subject<Uint8Array>();
  let response: Promise<AsyncIterable<Uint8Array | string> | undefined> =
    Promise.resolve(emptyResponse);
  await pipe(stream, async function (source) {
    const messages = map(message => message.slice(), source);
    const [header, bytes] = partition(1, messages);
    await pipeline(
      () => header,
      map(message => {
        const request = Request.fromBinary(message);
        const [promiseId, declareId] = resolveLater<string>();
        switch (request.type.oneofKind) {
          case 'send':
            incomingFiles.next({
              meta: request.type.send,
              content,
              declareId,
            });
            response = Promise.resolve(toAsyncIterable(promiseId));
            break;
          case 'receive':
            response = handleSend(request.type.receive);
            break;
        }
      }),
      consume
    );
    // await pipeline(() => source, map(message => console.log(String(message))), consume)
    // content.next(new Uint8Array([1,2,3]))
    await pipeline(
      () => bytes,
      map(message => content.next(message)),
      consume
    );
    content.complete();
  });
  await pipe((await response) || emptyResponse, stream);
  await pipe([], stream);
};

export async function sendFile({
  to,
  node,
  file,
}: {
  to: PeerId;
  node: Libp2p;
  file: File;
}): Promise<string> {
  let { name, type, size, lastModified } = file;
  const getFileAsAsyncIterable = async function* () {
    yield Request.toBinary({
      type: {
        oneofKind: 'send',
        send: {
          name,
          type,
          size: BigInt(size),
          lastModified: BigInt(lastModified),
        },
      },
    });
    const reader = file.stream().getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  };
  const { stream } = await node.dialProtocol(to, PROTOCOL);
  return pipe(
    () => getFileAsAsyncIterable(),
    stream,
    async function (source) {
      for await (const message of source) {
        return String(message); // _id
      }
    }
  );
}
