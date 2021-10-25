import {Observable, Observer} from "rxjs";
import {base64} from "rfc4648";
import type {SchemaProtocol} from "../../../protocols/file";
import {EventEmitter} from "events";
import {concatArrayBuffers} from "./async-queue";

export interface Message {
    id: string
    type: string
}

export interface Log extends Message {
    message: string|number;
}

export interface RPCRequest extends Message {
    func: string
    args: Array<string>
}

export interface RPCResponse extends RPCRequest {
    response?: string
    status?: string
}

export interface DataMessage extends Message {
    meta: SchemaProtocol.Meta
    data: string
    status: string
}

let adaptor = {}

export const register = (obj:Object) =>{
    postLog(JSON.stringify(obj))
    adaptor = {...adaptor,...obj}
}
let emitter = new EventEmitter()
document.addEventListener("message", async function (event: any) {
    const data: RPCRequest | DataMessage = JSON.parse(event.data)
    postLog(JSON.stringify(data))
    if (data.type === "RPC") {
        try {
            // @ts-ignore
            const response: RPCResponse = await adaptor[data.func](data)
            postOnSuccess(response)
        } catch (e) {
            postOnError((e as Error), data as RPCRequest)
        }
    }
    if (data.type === "RPCStream") {
        try {
            // @ts-ignore
            const response: { source: AsyncIterable<Uint8Array>; meta: SchemaProtocol.Meta } = await adaptor[data.func](data)
            await streamSend(data.id,response.source,response.meta)
        } catch (e) {
            postOnError((e as Error), data as RPCRequest)
        }

    }
    if (data.type === "STREAM") {
        _streamListener(data as DataMessage)
    }
}, false);
// @ts-ignore
export const postMessage = (data: RPCRequest | Log | RPCResponse | DataMessage) => window.ReactNativeWebView.postMessage(JSON.stringify(data))
export const postLog = (message: number | string) => postMessage({id: "", type: "LOG", message})
export const postOnError = (e: Error, data: RPCRequest) => {
    postLog(`${data.func} failed`)
    postMessage({
        ...data,
        status: "failed",
        response: (e as Error).message,
        type: "RESPONSE"
    })
}
export const postOnSuccess = (data: RPCResponse) => {
    postLog(`${data.func} success`)
    data.status = "done"
    data.type = "RESPONSE"
    postMessage(data)
}

export const _streamListener = (data: DataMessage) => {
    if (data.status === "START") {
        const obs$ = new Observable((observer: Observer<Uint8Array>) => {
            emitter.on(data.id + "CHUNK", val => observer.next(base64.parse(val)));
            emitter.once(data.id + 'error', err => observer.error(err));
            emitter.once(data.id + "END", () => {
                emitter.removeAllListeners(data.id);
                observer.complete();
            })
        });
        emitter.emit(data.id + "CALLBACK", {source: obs$, meta: data.meta})
    }
    if (data.status === "CHUNK" && "data" in data) {
        emitter.emit(data.id + "CHUNK", data.data)
    }
    if (data.status === "END" && "data" in data) {
        emitter.emit(data.id + "END", data.data)
    }
}

export const streamResponse = (transferId: string) => {
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
            type: "STREAM",
            meta: meta,
            status: "START",
            data: ""
        })
        let buffer = []
        for await (const chunk of iterator) {
            if (buffer.length < 3) {
                buffer.push(Uint8Array.from(chunk))
            } else {
                postMessage({
                    id: transferId,
                    type: "STREAM",
                    meta: meta,
                    status: "CHUNK",
                    data: base64.stringify(concatArrayBuffers(buffer))
                })
                buffer = []
                buffer.push(Uint8Array.from(chunk))
            }

        }
        if (buffer.length > 0) {
            postMessage({
                id: transferId,
                type: "STREAM",
                meta: meta,
                status: "CHUNK",
                data: base64.stringify(concatArrayBuffers(buffer))
            })
        }
        postMessage({
            id: transferId,
            type: "STREAM",
            meta: meta,
            status: "END",
            data: ""
        })
        resolve(true)
    })
}
