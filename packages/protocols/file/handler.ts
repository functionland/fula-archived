import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { ProtocolHandler } from '..';
import { PROTOCOL } from './constants';
import { deflate } from 'pako';
import { Request, Meta } from './schema';
import { Subject, lastValueFrom } from 'rxjs';

interface Streamer extends AsyncIterable<Uint8Array> {
  pause(): void;
  resume(): void;
  jumpTo(skip: number)
}

interface FileStream {
  read(): Promise<Uint8Array>;
  stream(skip?: number): Streamer
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

export const incomingFiles = new Subject<{
    meta: Meta,
    content: Subject<Uint8Array>,
    done: Promise<void>
  }>();

export const handleFile: ProtocolHandler = async ({stream}) => {
  let requestIdentified = false;
  const content = new Subject<Uint8Array>();
  await pipe(
    stream,
    async function (source) {
      for await (let message of source) {
        message = message.slice();
        if (!requestIdentified) {
          const request = Request.fromBinary(message);
          switch (request.type.oneofKind) {
            case 'send':
              incomingFiles.next({
                meta: request.type.send,
                content,
                done: lastValueFrom(content).then()
              })
              break;
            case 'receive':
              break;
          }
          requestIdentified = true;
          continue;
        }
        content.next(message)
      }
      content.complete();
    }
  )
  await pipe(['done'], stream)
  await pipe([], stream)
}

export async function sendFile({to, node, file}: {to: PeerId, node: Libp2p, file: File}) {
  let { name, type, size, lastModified } = file;
  const getFileAsAsyncIterable = async function * () {
    yield Request.toBinary({
      type: {
        oneofKind: 'send',
        send: { name, type, size: BigInt(size), lastModified: BigInt(lastModified) }
      }
    });
    const reader = file.stream().getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
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
