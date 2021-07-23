import pipe from 'it-pipe';
import { ProtocolHandler } from '../..';
import { Request, Chunk } from '../schema';
import { partition, toAsyncIterable } from '../../util';
import { map, consume } from 'streaming-iterables';
import { save } from './save';
import { retrieve } from './retrieve';

export type Response = Promise<AsyncIterable<Uint8Array | string> | undefined>;

const emptyResponse = toAsyncIterable(Promise.resolve('Empty response'));

export const handleFile: ProtocolHandler = async ({ stream }) => {
  let response: Response = Promise.resolve(emptyResponse);
  await pipe(stream, async function (source) {
    const [header, bytes] = partition(
      1,
      map(message => message.slice(), source)
    );
    await consume(
      map(async message => {
        const request = Request.fromBinary(message);
        switch (request.type.oneofKind) {
          case 'send':
            response = save({ meta: request.type.send, bytes });
            break;
          case 'receive':
            response = retrieve(request.type.receive);
            break;
        }
      }, header)
    );
  });
  await pipe((await response) || emptyResponse, stream);
  await pipe([], stream);
};

export { incomingFiles, sendFile } from './save';
export { setRetrievalMethod } from './retrieve';
