import { HandlerProps } from 'libp2p';
import { toAsyncIterable } from 'async-later';
import * as Graph from './handlers';
import * as Schema from './schema';

export type ProtocolHandler = (props: HandlerProps) => void;

export type Response<T = Uint8Array | string> = Promise<
  AsyncIterable<T> | undefined
>;

export const Response = {
  get EMPTY() {
    return toAsyncIterable(Promise.resolve('Empty response'));
  }
};

export * from './schema'
export * from './handlers'

export default {
  Graph,
  Schema
};
