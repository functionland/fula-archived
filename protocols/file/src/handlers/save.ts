import { pipe } from 'it-pipe';
import type { MuxedStream } from 'libp2p';
import { Subject } from 'rxjs';
import { consume, map, pipeline } from 'streaming-iterables';
import { resolveLater, toAsyncIterable } from 'async-later';
import { Meta, Request } from '../schema';
import { PROTOCOL, ENCRYPTION_BLOCK_SIZE } from '../constants';
import * as it from "it-stream-types";
import aes from 'aes-js'

export const incomingFiles = new Subject<{
    meta: Meta;
    getContent: () => AsyncIterable<Uint8Array>;
    declareId(id: string): void;
}>();


//TODO: Too hard to understand and the bytes is not real AsyncIterable it has size of 1 always.
export async function save({ meta, bytes }: { meta: Meta, bytes: AsyncIterable<Uint8Array> }) {
    const [promiseId, declareId] = resolveLater<string>();
    const content = new Subject<Uint8Array>();
    incomingFiles.next({meta, getContent: () => toAsyncIterable(content), declareId});
    await pipeline(
      () => bytes,
      map(message => content.next(message)),
      consume
    );
    content.complete();
    const cid = await promiseId
    const uint8array = new TextEncoder().encode(cid);
    return toAsyncIterable([uint8array]);
}

export async function sendFile({ connection, file, symKey = Uint8Array.from([]), iv = Uint8Array.from([]) }: {
    connection: { stream: MuxedStream, protocol: string },
    file: File,
    symKey?: Uint8Array,
    iv?: Uint8Array
}): Promise<string> {
    if (connection.protocol !== PROTOCOL) {
        throw Error('Protocol mismatched')
    }
    const { name, type, size, lastModified } = file;
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

        const fileSize = file.size
        let startP = 0
        let endP = ENCRYPTION_BLOCK_SIZE

        while (startP < fileSize || startP == 0) {
            const block = file.slice(startP, endP)

            if (symKey.length) {
                const aescbc = new aes.ModeOfOperation.cbc(symKey, iv)

                let _encrypted
                if ((fileSize - endP) < 0)
                    _encrypted = await aescbc.encrypt(aes.padding.pkcs7.pad(new Uint8Array(await block.arrayBuffer())))
                else
                    _encrypted = await aescbc.encrypt(new Uint8Array(await block.arrayBuffer()))

                yield _encrypted
            } else
                yield new Uint8Array(await block.arrayBuffer())

            startP += ENCRYPTION_BLOCK_SIZE
            endP += ENCRYPTION_BLOCK_SIZE
        }
    };

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return pipe(streamSendFile, connection.stream as it.Duplex<any>, async function (source: it.Source<any>) {
        let response: Uint8Array | undefined = undefined;
        for await (const message of source) {
            response = message; // id
        }
        if (response === undefined) {
            throw Error()
        }
        return new TextDecoder().decode(response)
    });

}


export async function streamFile({ connection, source, meta }: {
    connection: { stream: MuxedStream, protocol: string },
    source: AsyncIterable<Uint8Array>;
    meta: Meta
}): Promise<string> {
    if (connection.protocol !== PROTOCOL) {
        throw Error('Protocol mismatched')
    }
    const { name, type, size, lastModified } = meta;
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
        for await (const value of source) {
            yield value
        }
    };
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return pipe(streamSendFile, connection.stream as it.Duplex<any>, async function (_source: any) {
        let response: Uint8Array | undefined = undefined;
        for await (const message of _source) {
            response = message; // id
        }
        if (response === undefined) {
            throw Error()
        }

        return new TextDecoder().decode(response)
    });

}

