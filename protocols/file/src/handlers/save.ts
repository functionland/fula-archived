import pipe from 'it-pipe';
import type { MuxedStream } from 'libp2p';
import { Subject } from 'rxjs';
import { consume, map, pipeline } from 'streaming-iterables';
import { resolveLater, toAsyncIterable } from 'async-later';
import { Response } from '../';
import { Meta, Request } from '../schema';
import { PROTOCOL } from '../constants';

export const incomingFiles = new Subject<{
    meta: Meta;
    getContent: () => AsyncIterable<Uint8Array>;
    declareId(id: string): void;
}>();

export async function save({meta, bytes}: { meta: Meta, bytes: AsyncIterable<Uint8Array> }): Response {
    const [promiseId, declareId] = resolveLater<string>();
    const content = new Subject<Uint8Array>();
    incomingFiles.next({meta, getContent: () => toAsyncIterable(content), declareId});
    await pipeline(
        () => bytes,
        map(message => content.next(message)),
        consume
    );
    content.complete();
    return toAsyncIterable(promiseId);
}

export async function sendFile({connection, file}: {
    connection: { stream: MuxedStream, protocol: string },
    file: File;
}): Promise<string> {
    if (connection.protocol !== PROTOCOL) {
        console.log('Protocol mismatched')
        throw Error('Protocol mismatched')
    }
    console.log('are u run?')
    const {name, type, size, lastModified} = file;
    console
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
        const reader = (file.stream() as unknown as ReadableStream).getReader();
        while (true) {
            const {value, done} = await reader.read();
            if (done) {
                break;
            }
            yield value;
        }
    };

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return pipe(streamSendFile, connection.stream, async function (source: any) {
        for await (const message of source) {
            return String(message); // id
        }
    });

}


export async function streamFile({connection, source, meta}: {
    connection: { stream: MuxedStream, protocol: string },
    source: AsyncIterable<Uint8Array>;
    meta:Meta
}): Promise<string> {
    if (connection.protocol !== PROTOCOL) {
        throw Error('Protocol mismatched')
    }
    const {name, type, size, lastModified} = meta;
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
        for await (const value of source){
            yield value
        }
    };
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return pipe(streamSendFile, connection.stream, async function (_source: any) {
        for await (const message of _source) {
            return String(message); // id
        }
    });

}
