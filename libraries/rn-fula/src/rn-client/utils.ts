// @ts-ignore
import { decode as atob } from 'base-64';
import * as FileSystem from 'expo-file-system';
import type { SchemaProtocol } from '../../../protocols/file';

export async function* fileReader2(
  uri: string,
  chunksAmount: number = 1048576
): AsyncIterable<String | SchemaProtocol.Meta> {
  const info = await FileSystem.getInfoAsync(uri);
  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64
  });
  let name = getFileName(uri);
  let res = await fetch(uri);
  let blob = await res?.blob();
  // @ts-ignore
  yield {
    name,
    type: blob.type,
    lastModified: info.modificationTime,
    size: info.size
  };
  let byteStart = 0;
  let byteEnd = chunksAmount;
  while (byteStart < content.length) {
    yield content.slice(byteStart, byteEnd);
    byteStart = byteEnd;
    byteEnd += chunksAmount;
    if (byteEnd >= content.length) {
      byteEnd = content.length;
    }
  }
}

function getFileName(str: string) {
  // @ts-ignore
  return str.split('\\').pop().split('/').pop();
}

export function generateUUID(digits: number) {
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ';
  let uuid = [];
  for (let i = 0; i < digits; i++) {
    uuid.push(str[Math.floor(Math.random() * str.length)]);
  }
  return uuid.join('');
}

export function concatArrayBuffers(bufs: any[]) {
  const result = new Uint8Array(
    bufs.reduce((totalSize, buf) => totalSize + buf.byteLength, 0)
  );
  bufs.reduce((offset, buf) => {
    result.set(buf, offset);
    return offset + buf.byteLength;
  }, 0);
  return result;
}
