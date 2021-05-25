import * as codec from '@ipld/dag-cbor'
import { fromIterable } from './fbl'
import {sha256 as hasher } from 'multiformats/hashes/sha2'

export async function * fileToBlocks<T>(file: File) {
  const getIterable = async function * () {
    const reader = file.stream().getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  }
  for await (const block of fromIterable(getIterable(), { codec, hasher })) {
    yield block;
  }
}
