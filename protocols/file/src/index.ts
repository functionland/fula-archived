import { HandlerProps } from 'libp2p';
// @ts-ignore
import { toAsyncIterable } from 'async-later';
import * as File from './handlers';
import * as Schema from './schema'


export type ProtocolHandler = (props: HandlerProps) => void;

export type Response<T = Uint8Array | string> = Promise<AsyncIterable<T> | undefined>;

export const Response = {
  get EMPTY() {
    return toAsyncIterable(Promise.resolve('Empty response'));
  },
};

export { File as FileProtocol,  Schema as SchemaProtocol};

export default {
  File,
  Schema
};
