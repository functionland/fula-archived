import pipe from 'it-pipe';
import { partition, firstValue } from 'async-later';
import { map } from 'streaming-iterables';
import { ProtocolHandler, Response } from '../';
import { Request } from '../schema';
import { save } from './save';
import { retrieve } from './retrieve';
import { getMeta } from './meta';
import {PROTOCOL} from '../constants'

export const handleFile: ProtocolHandler = async ({ stream }) => {
  let response: Response = Promise.resolve(Response.EMPTY);
  await pipe(stream, async function (source) {
    const [streamHead, streamTail] = partition(
      1,
      map(message => message.slice(), source)
    );
    const request = Request.fromBinary(await firstValue(streamHead));
    switch (request.type.oneofKind) {
      case 'send':
        response = save({ meta: request.type.send, bytes: streamTail });
        break;
      case 'receive':
        response = retrieve(request.type.receive);
        break;
      case 'meta':
        response = getMeta({ id: request.type.meta });
        break;
    }
  });
  await pipe((await response) || Response.EMPTY, stream);
  await pipe([], stream); // Close the stream
};

export { incomingFiles, sendFile, streamFile } from './save';
export { setContentRetrievalMethod, receiveContent } from './retrieve';
export { setMetaRetrievalMethod, receiveMeta } from './meta';
export {PROTOCOL}
