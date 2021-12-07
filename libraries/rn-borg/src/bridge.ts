import {EventEmitter} from "events";
import {Observable, Observer} from "rxjs";
import {generateUUID} from "./utils";
import {
    Chunk,
    ChunkStatusType,
    Log,
    Message,
    MessageType,
    RPCRequest,
    RPCResponse,
    RPCStatusType
} from "../../rn-borg-types";
import {SchemaProtocol} from "../../../protocols/file";

const emitter = new EventEmitter()

export const messageHandler = (event: { nativeEvent: { data: string; }; }) => {
    const data: Message | RPCResponse | Chunk = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
        case MessageType.Log: {
            console.log("[bridge] " + (data as Log).message)
            break
        }
        case MessageType.RPCResponse: {
            const response = data as RPCResponse
            emitter.emit(response.id, response)
            break
        }
        case MessageType.StreamChunk: {
            _streamListener(data as Chunk)
            break
        }
        default: {
            throw Error('Cant handle this type of message')
        }
    }
}

export const _streamListener = (data: Chunk) => {
    switch (data.status) {
        case ChunkStatusType.START: {
            const observable = new Observable((observer: Observer<string>) => {
                emitter.on(data.id + "CHUNK", val => observer.next(val));
                emitter.once(data.id + 'error', err => observer.error(err));
                emitter.once(data.id + "END", () => {
                    emitter.removeAllListeners(data.id);
                    observer.complete();
                })
            });
            emitter.emit(data.id + "CALLBACK", {source: observable, meta: data.meta})
            break
        }
        case ChunkStatusType.CHUNK: {
            emitter.emit(data.id + "CHUNK", data.data)
            break
        }
        case ChunkStatusType.END: {
            emitter.emit(data.id + "END", data.data)
            break
        }
        default: {
            throw Error('Wrong type of stream')
        }
    }
}

export const eventBaseStreamToPromise = (transferId: string) => {
    return new Promise<{ source: Observable<string>, meta: any }>((resolve, reject) => {
        emitter.once(transferId + "CALLBACK", ({source, meta}: { source: Observable<string>, meta: any }) => {
            resolve({source, meta})
        })
    })
}

export function bridge(postMessage: (m: RPCRequest | Chunk) => void) {
    return {
        async streamSend(transferId: string, iterator: Iterator<String>, meta: SchemaProtocol.Meta) {
            postMessage({
                id: transferId,
                type: MessageType.StreamChunk,
                meta: meta,
                status: ChunkStatusType.START,
                data: ""
            })
            while (true) {
                const {value, done} = await iterator.next();
                if (done) {
                    postMessage({
                        id: transferId,
                        type: MessageType.StreamChunk,
                        meta: meta,
                        status: ChunkStatusType.END,
                        data: ""
                    })
                    break;
                }
                postMessage({
                    id: transferId,
                    type: MessageType.StreamChunk,
                    meta: meta,
                    status: ChunkStatusType.CHUNK,
                    data: value
                })
            }
        },
        async RPC(func: string, args: Array<any>) {
            return new Promise<RPCResponse>((resolve, reject) => {
                // @ts-ignore
                const id = generateUUID(10)
                postMessage({
                    id,
                    function: func,
                    args,
                    type: MessageType.RPCRequest
                })
                emitter.once(id, (data: RPCResponse) => {
                    if (data.status === RPCStatusType.failed)
                        return reject
                    return resolve(data)
                })
            })
        },
        async RPCStreamResponse(func: string, args: Array<any>) {
            // @ts-ignore
            const id = generateUUID(10)
            postMessage({
                id,
                function: func,
                args,
                type: MessageType.RPCRequestStream
            })
            return eventBaseStreamToPromise(id)
        },
        RPCStreamArgs(func: string, args: Array<any>, {
            iterator,
            meta
        }: { iterator: Iterator<any>, meta: SchemaProtocol.Meta }) {
            return new Promise<RPCResponse>(async (resolve, reject) => {
                const id = generateUUID(10)
                postMessage({
                    id,
                    function: func,
                    args,
                    type: MessageType.RPCRequest
                })
                await this.streamSend(id, iterator, meta)
                emitter.once(id, (data: RPCResponse) => {
                    if (data.status === RPCStatusType.failed)
                        return reject
                    return resolve(data)
                })
            })
        }
    }
}
