import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { Subject } from 'rxjs';
import { map, consume, pipeline } from 'streaming-iterables';
import { resolveLater, toAsyncIterable } from 'async-later';
import { Response } from '../..';
import { Request, Meta } from '../schema';
import { PROTOCOL } from '../constants';

export const incomingFiles = new Subject<{
  meta: Meta;
  getContent: () => AsyncIterable<Uint8Array>;
  declareId(id: string): void;
}>();

export async function save({
  meta,
  bytes,
}: {
  meta: Meta;
  bytes: AsyncIterable<Uint8Array>;
}): Response {
  const [promiseId, declareId] = resolveLater<string>();
  const content = new Subject<Uint8Array>();
  incomingFiles.next({ meta, getContent: () => toAsyncIterable(content), declareId });
  await pipeline(
    () => bytes,
    map(message => content.next(message)),
    consume
  );
  content.complete();
  return toAsyncIterable(promiseId);
}

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
  const streamSendFile = async function* () {
    yield Request.toBinary({
      type: {
        oneofKind: 'send',
        send: {
          name,
          type,
          size,
          lastModified
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
  return pipe(streamSendFile, stream, async function (source) {
    for await (const message of source) {
      return String(message); // id
    }
  });
}
