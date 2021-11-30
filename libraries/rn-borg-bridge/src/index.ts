import {Borg, createClient} from '@functionland/borg'
import {observableToAsyncGenerator} from "./utils";
import {eventBaseStreamToPromise, postLog as log, register} from "./bridge";
import type {RPCRequest, RPCResponse} from "../../rn-borg-types";
import {MessageType, RPCStatusType} from "../../rn-borg-types";


async function main() {
    let borgClient: Borg
    const receiveFile = async (data: RPCRequest) => {
        const {source, meta} = await borgClient.receiveStreamFile(data.args[0])
        return {source, meta}
    }
    const sendFile = async (data: RPCRequest): Promise<RPCResponse> => {
        const {source, meta} = await eventBaseStreamToPromise(data.id)
        const fileId = await borgClient.sendStreamFile(observableToAsyncGenerator(source), meta)
        return {
            id: data.id,
            payload: fileId,
            status: RPCStatusType.done,
            type: MessageType.RPCResponse
        }
    }
    const start = async (data: RPCRequest): Promise<RPCResponse> => {
        borgClient = await createClient();
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
            payload: await borgClient.connect(<string>data.args[0]),
            status: RPCStatusType.done,
            type: MessageType.RPCResponse
        }
    }
    const receiveMeta = async (data: RPCRequest) => {
        return {
            id: data.id,
            payload: await borgClient.receiveMeta(<string>data.args[0]),
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


