import {EventEmitter} from "events";
import {Observer, Observable} from "rxjs";
import {generateUUID} from "./utils";
import {SchemaProtocol} from "../../../../protocols/file";

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

const emitter = new EventEmitter()



export const messageHandler = (event: { nativeEvent: { data: string; }; }) => {
    const data: Message | RPCResponse | RPCRequest | DataMessage = JSON.parse(event.nativeEvent.data);
    if (data.type === "LOG") {
        console.log("[bridge] " + (data as Log).message);
    }
    if (data.type === "RESPONSE") {
        emitter.emit(data.id, data)
    }
    if (data.type === "STREAM") {
        _streamListener(data as DataMessage)
    }
}

export const _streamListener = (data: DataMessage) => {
    if (data.status === "START") {
        const obs$ = new Observable((observer: Observer<string>) => {
            emitter.on(data.id + "CHUNK", val => observer.next(val));
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
    return new Promise<{ source: Observable<string>, meta: any }>((resolve, reject) => {
        emitter.once(transferId + "CALLBACK", ({source, meta}: { source: Observable<string>, meta: any }) => {
            resolve({source, meta})
        })
    })
}

export function transporter(postMessage:(m:DataMessage|RPCRequest|RPCResponse)=>void){
    return {
        async streamSend(transferId: string, iterator: Iterator<String>, meta: SchemaProtocol.Meta) {
            postMessage({
                id: transferId,
                type: "STREAM",
                meta: meta,
                status: "START",
                data: ""
            })
            while (true) {
                const {value, done} = await iterator.next();
                if (done) {
                    postMessage({
                        id: transferId,
                        type: "STREAM",
                        meta: meta,
                        status: "END",
                        data: ""
                    })
                    break;
                }
                postMessage({
                    id: transferId,
                    type: "STREAM",
                    meta: meta,
                    status: "CHUNK",
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
                    func,
                    args,
                    type: "RPC"
                })
                emitter.once(id, (data: RPCResponse) => {
                    if (data.status === "failed")
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
                func,
                args,
                type: "RPCStream"
            })
            return streamResponse(id)
        },
        RPCStreamArgs(func: string, args: Array<any>, {
            iterator,
            meta
        }: { iterator: Iterator<any>, meta: SchemaProtocol.Meta }) {
            return new Promise<RPCResponse>(async (resolve, reject) => {
                const id = generateUUID(10)
                postMessage({
                    id,
                    func,
                    args,
                    type: "RPC"
                })
                await this.streamSend(id, iterator, meta)
                emitter.once(id, (data: RPCResponse) => {
                    if (data.status === "failed")
                        return reject
                    return resolve(data)
                })
            })
        }
    }
}



const func = "receiveFile"
// @ts-ignore
