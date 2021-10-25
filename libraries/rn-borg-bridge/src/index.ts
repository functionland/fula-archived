import {Borg, createClient} from '@functionland/borg'
import otag from "./async-queue";
import type {RPCRequest, RPCResponse} from "./bridge";
import {register, streamResponse} from "./bridge";
import {postLog as log, streamSend} from "./bridge";
import type {SchemaProtocol} from "../../../protocols/file";
// import debug from 'debug'

// debug.disable("libp2p*")


async function main() {
    let borgClient: Borg

    const receiveFile = async (data: RPCRequest) => {
        const {source, meta} = await borgClient.receiveStreamFile(data.args[0])
        return {source, meta}
    }
    const sendFile = async (data: RPCRequest) => {
        const {source, meta} = await streamResponse(data.id)
        const fileId = await borgClient.sendStreamFile(otag(source), meta)
        return {
            ...data,
            response: fileId,
        }
    }

    const start = async (data: RPCRequest) => {
        borgClient = await createClient();
        const node = borgClient.getNode()
        node.connectionManager.on('peer:connect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
            log(`Connected to ${connection.remotePeer.toB58String()}`);
        });
        node.connectionManager.on('peer:disconnect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
            log(`Disconnected from ${connection.remotePeer.toB58String()}`);
        });
        node.on('peer:discovery', async (peerId: { toB58String: () => any; }) => {
            log(`Found peer ${peerId.toB58String()}`);
        });
        return {
            ...data,
            response: "Ready",
        }
    }

    const connect = async (data: RPCRequest) => {
        return {
            ...data,
            response: await borgClient.connect(<string>data.args[0]),
        }
    }

    const receiveMeta = async (data: RPCRequest) => {
        return {
            ...data,
            response: await borgClient.receiveMeta(<string>data.args[0])
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

main().catch(console.error);


