import pipe from 'it-pipe';
import { partition, firstValue } from 'async-later';
import { map } from 'streaming-iterables';
import { ProtocolHandler, Response } from '../';
import {Request} from '../schema';
import {resolve, subscriptionResolve} from './resolve';
import { PROTOCOL } from '../constants';

export const handler: ProtocolHandler = async ({ stream }) => {
  let response//: Response = Promise.resolve(Response.EMPTY);
  await pipe(stream, async function (source) {
    const [streamHead, streamTail] = partition(
      1,
      map((message) => message.slice(), source)
    );
    const request = Request.fromBinary(await firstValue(streamHead));
    if(!request.subscribe)
      response = resolve(request)
    else
      response = subscriptionResolve(request)
  });
  await pipe((await response) || Response.EMPTY, stream);
  await pipe([], stream); // Close the stream
};

export { setQueryResolutionMethod, submitQuery, setSubscriptionQueryResolutionMethod, submitSubscriptionQuery } from './resolve';
export { PROTOCOL };
