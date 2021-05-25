import { Block, BlockEncoder } from 'multiformats/block';
import { CID } from 'multiformats/cid';
import { MultihashHasher } from 'multiformats/hashes/interface';

export function fromIterable<T, Code extends number>(
  iterable: AsyncIterable<T>,
  { hasher, codec, algo }: {
    hasher: MultihashHasher,
    codec: BlockEncoder<Code, T>,
    algo?: AsyncGenerator<Block<T>>
  }
): AsyncGenerator<Block<T>>;

export function size<T>(block: Block<T>): number;

export function read<T>(
  block: Block<T> | CID,
  get: (cid: CID) => PromiseLike<Block<T>>,
  offset?: number,
  end?: number
): AsyncGenerator<T>;

export function balanced<T>(limit?: number): AsyncGenerator<Block<T>>;
