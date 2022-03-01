import {Borg, createClient} from '@functionland/fula'
import {observableToAsyncGenerator} from "./utils";
import {eventBaseStreamToPromise, postLog as log, register} from "./bridge";
import type {RPCRequest, RPCResponse} from "../types";
import {MessageType, RPCStatusType} from "../types";


async function main() {
    console.log('it start')
    let fulaClient: Borg
    const receiveFile = async (data: RPCRequest) => {
        const {source, meta} = await fulaClient.receiveStreamFile(data.args[0])
        return {source, meta}
    }
    const sendFile = async (data: RPCRequest): Promise<RPCResponse> => {
        const {source, meta} = await eventBaseStreamToPromise(data.id)
        const fileId = await fulaClient.sendStreamFile(observableToAsyncGenerator(source), meta)
        return {
            id: data.id,
            payload: fileId,
            status: RPCStatusType.done,
            type: MessageType.RPCResponse
        }
    }
    const start = async (data: RPCRequest): Promise<RPCResponse> => {
        fulaClient = await createClient();
        return {
            id: data.id,
            payload: "Ready",
            status: RPCStatusType.done,
            type: MessageType.RPCResponse
        }
    }
    const connect = async (data: RPCRequest) => {
        return {
            id: data.id,
            payload: await fulaClient.connect(<string>data.args[0]),
            status: RPCStatusType.done,
            type: MessageType.RPCResponse
        }
    }
    const receiveMeta = async (data: RPCRequest) => {
        return {
            id: data.id,
            payload: await fulaClient.receiveMeta(<string>data.args[0]),
            status: RPCStatusType.done,
            type: MessageType.RPCResponse
        }
    }
    const adaptor = {
        connect,
        receiveMeta,
        sendFile,
        receiveFile,
        start
    }
    register(adaptor)
}

main().catch(e => log(e));


