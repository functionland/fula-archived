import { HandlerProps } from 'libp2p';
// @ts-ignore
import { toAsyncIterable } from 'async-later';
import * as Graph from './graph';
import * as File from './file';
import * as Schema from './file/schema'


export type ProtocolHandler = (props: HandlerProps) => void;

export type Response<T = Uint8Array | string> = Promise<AsyncIterable<T> | undefined>;

export const Response = {
  get EMPTY() {
    return toAsyncIterable(Promise.resolve('Empty response'));
  },
};

export { File as FileProtocol, Graph as GraphProtocol,  Schema as SchemaProtocol};

export default {
  File,
  Graph,
  Schema
};
