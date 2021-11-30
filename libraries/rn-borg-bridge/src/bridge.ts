import {Observable, Observer} from "rxjs";
import {base64} from "rfc4648";
import type {SchemaProtocol} from "../../../protocols/file";
import {EventEmitter} from "events";
import {concatArrayBuffers} from "./utils";
import type {Chunk, RPCRequest, RPCResponse} from "../../rn-borg-types";
import {ChunkStatusType, MessageType, RPCStatusType} from "../../rn-borg-types";


let adaptor = {}

export const register = (obj: Object) => {
    adaptor = {...adaptor, ...obj}
}

let emitter = new EventEmitter()

// Listening to message come from react native
document.addEventListener("message", async function (event: any) {
    const data: RPCRequest | Chunk = JSON.parse(event.data)
    switch (data.type) {
        case MessageType.RPCRequest: {
            try {
                // @ts-ignore
                const response: RPCResponse = await adaptor[data.func](data)
                postOnSuccess(response)
            } catch (e) {
                postOnError((e as Error), data as RPCRequest)
            }
            break;
        }
        case MessageType.RPCRequestStream: {
            try {
                // @ts-ignore
                const response: { source: AsyncIterable<Uint8Array>; meta: SchemaProtocol.Meta } = await adaptor[data.func](data)
                await streamSend(data.id, response.source, response.meta)
            } catch (e) {
                postOnError((e as Error), data as RPCRequest)
            }
            break;
        }
        case MessageType.StreamChunk: {
            _streamListener(data as Chunk)
            break;
        }
    }
}, false);

// @ts-ignore
export function postMessage (data: RPCRequest | Log | RPCResponse | DataMessage){
    const jsonData = JSON.stringify(data)
    // @ts-ignore
    if(window.ReactNativeWebView.postMessage === undefined ){
        setTimeout(postMessage, 200, jsonData)
    }
    // @ts-ignore
    window.ReactNativeWebView.postMessage(jsonData)
}

export const postLog = (str: string) => postMessage({type: MessageType.Log, str})

export const postOnError = (e: Error, data: RPCRequest) => {
    postLog(`${data.function} failed`)
    postMessage({
        id: data.id,
        status: RPCStatusType.failed,
        payload: `[${data.id}][${data.function}] failed with ${(e as Error).message}`,
        type: MessageType.RPCResponse
    })
}

export const postOnSuccess = (data: RPCResponse) => {
    postLog(`${data.id} success`)
    postMessage(data)
}

export const _streamListener = (data: Chunk) => {
    switch (data.status) {
        case ChunkStatusType.START: {
            const obs$ = new Observable((observer: Observer<Uint8Array>) => {
                emitter.on(data.id + "CHUNK", val => observer.next(base64.parse(val)));
                emitter.once(data.id + 'error', err => observer.error(err));
                emitter.once(data.id + "END", () => {
                    emitter.removeAllListeners(data.id);
                    observer.complete();
                })
            });
            emitter.emit(data.id + "CALLBACK", {source: obs$, meta: data.meta})
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
    }
}

export const eventBaseStreamToPromise = (transferId: string) => {
    return new Promise<{ source: Observable<Uint8Array>, meta: any }>((resolve, reject) => {
        emitter.once(transferId + "CALLBACK", ({source, meta}: { source: Observable<Uint8Array>, meta: any }) => {
            resolve({source, meta})
        })
    })
}

export async function streamSend(transferId: string, iterator: AsyncIterable<any>, meta: SchemaProtocol.Meta) {
    return new Promise<Boolean>(async (resolve, reject) => {
        postMessage({
            id: transferId,
            type: MessageType.StreamChunk,
            meta: meta,
            status: ChunkStatusType.START,
            data: ""
        })
        let buffer = []
        for await (const chunk of iterator) {
            if (buffer.length < 3) {
                buffer.push(Uint8Array.from(chunk))
            } else {
                postMessage({
                    id: transferId,
                    type: MessageType.StreamChunk,
                    meta: meta,
                    status: ChunkStatusType.CHUNK,
                    data: base64.stringify(concatArrayBuffers(buffer))
                })
                buffer = []
                buffer.push(Uint8Array.from(chunk))
            }

        }
        if (buffer.length > 0) {
            postMessage({
                id: transferId,
                type: MessageType.StreamChunk,
                meta: meta,
                status: ChunkStatusType.CHUNK,
                data: base64.stringify(concatArrayBuffers(buffer))
            })
        }
        postMessage({
            id: transferId,
            type: MessageType.StreamChunk,
            meta: meta,
            status: ChunkStatusType.END,
            data: ""
        })
        resolve(true)
    })
}
