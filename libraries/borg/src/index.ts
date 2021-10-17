// @ts-ignore
import type {SchemaProtocol} from "@functionland/file-protocol";
import {FileProtocol} from '@functionland/file-protocol';
import {configure} from './config';
import Libp2p, {Connection, constructorOptions, Libp2pOptions} from 'libp2p';
import PeerId from 'peer-id';
import {SIG_MULTIADDRS} from "./constant";


// types
export interface Borg {
    connect: (peerId: string) => Promise<boolean>
    sendFile: (file: File) => Promise<string>
    receiveFile: (fileId: string) => Promise<File>
    receiveMeta: (fileId: string) => Promise<SchemaProtocol.Meta>
    getNode: () => Libp2p
}

// end of types

export async function createClient(config?: Libp2pOptions & constructorOptions): Promise<Borg> {
    let node: Libp2p;
    let conf: any;
    let serverPeer: PeerId;
    let connection: Connection | undefined;
    let nodePeerId: PeerId;

    if (config) conf = await configure(config);
    else conf = await configure();
    nodePeerId = conf.PeerId;
    node = await Libp2p.create(conf);
    node.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);
    await node.start();

    return {
        async connect(peer: string) {
            let serverPeerId = PeerId.createFromB58String(peer)
            node.peerStore.addressBook.set(serverPeerId, SIG_MULTIADDRS)
            try {
                // TODO make sure connection stay open by listening to node connection events
                connection = await node.dial(serverPeerId)
                return true;
            } catch (e) {
                console.log(e)
                return false
            }
        },
        async sendFile(file) {
            if (!connection) {
                throw Error('No Connection Exist')
            }
            try {
                const connectionObj = await connection.newStream(FileProtocol.PROTOCOL)
                const fileId = await FileProtocol.sendFile({connection: connectionObj, file});
                connectionObj.stream.close()
                return fileId
            } catch (e) {
                console.log(e)
                throw new Error((e as Error).message)
            }
        },

        async receiveFile(id: string) {
            if (!connection) {
                throw Error('No Connection Exist')
            }
            try {
                const connectionObj = await connection.newStream(FileProtocol.PROTOCOL)
                const meta = await FileProtocol.receiveMeta({connection: connectionObj, id})
                const connectionObj2 = await connection.newStream(FileProtocol.PROTOCOL)
                const source = FileProtocol.receiveContent({connection: connectionObj2, id})
                let content: Array<any> = [];
                for await (const chunk of source) {
                    content.push(...chunk);
                }
                const blob = new Blob([Uint8Array.from(content)], {type: meta.type})
                connectionObj.stream.close()
                return new File([blob], meta.name, {type: meta.type, lastModified: meta.lastModified});
            } catch (e) {
                throw Error((e as Error).message)
            }

        },
        async receiveMeta(id: string) {
            if (!connection) {
                throw Error('No Connection Exist')
            }
            try {
                const connectionObj = await connection.newStream(FileProtocol.PROTOCOL)
                const meta: SchemaProtocol.Meta = await FileProtocol.receiveMeta({connection: connectionObj, id});
                connectionObj.stream.close()
                return meta;
            } catch (e) {
                throw new Error((e as Error).message)
            }
        },
        getNode() {
            return node;
        }
    };
}
