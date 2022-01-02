import type {SchemaProtocol} from "@functionland/file-protocol";
import {FileProtocol} from '@functionland/file-protocol';
import {configure} from './config';
import Libp2p, {Connection, constructorOptions, Libp2pOptions} from 'libp2p';
import PeerId from 'peer-id';
import {SIG_MULTIADDRS} from "./constant";


// types
declare type FileId = string

export interface Borg {
    connect: (peerId: string) => Promise<boolean>
    sendFile: (file: File) => Promise<FileId>
    sendStreamFile: (source: AsyncIterable<Uint8Array>, meta: SchemaProtocol.Meta) => Promise<FileId>
    receiveFile: (fileId: FileId) => Promise<File>
    receiveStreamFile: (fileId: FileId) => Promise<{ source: AsyncIterable<Uint8Array>, meta: SchemaProtocol.Meta }>
    receiveMeta: (fileId: FileId) => Promise<SchemaProtocol.Meta>
    getNode: () => Libp2p
    close: () => void
}

// end of types

export async function createClient(config?: Partial<Libp2pOptions & constructorOptions>): Promise<Borg> {
    const conf = await configure(config);
    const node = await Libp2p.create(conf);
    let connection: Connection | undefined;
    let serverPeerId: PeerId

    node.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);
    await node.start();

    const _getStreamConnection = async () => {
        if (!serverPeerId) {
            throw Error('no server peer found')
        }
        if (!node) {
            throw Error('node not ready')
        }
        if (!connection || connection.stat.status !== 'open') {
            throw Error('Server Unreachable')
        }
        return await connection.newStream(FileProtocol.PROTOCOL)
    }

    return {
        async connect(peer: string) {
            serverPeerId = PeerId.createFromB58String(peer)
            node.peerStore.addressBook.set(serverPeerId, SIG_MULTIADDRS)
            try {
                await node.ping(serverPeerId)
                // TODO make sure connection stay open by listening to node connection events
                connection = await node.dial(serverPeerId)
                return true;
            } catch (e) {
                console.log(e)
                return false
            }
        },
        async sendFile(file) {
            try {
                const connectionObj = await _getStreamConnection()
                const fileId = await FileProtocol.sendFile({connection: connectionObj, file});
                connectionObj.stream.close()
                return fileId
            } catch (e) {
                console.log(e)
                throw new Error((e as Error).message)
            }
        },
        async sendStreamFile(source, meta: SchemaProtocol.Meta) {
            try {
                const connectionObj = await _getStreamConnection()
                const fileId = await FileProtocol.streamFile({connection: connectionObj, source, meta});
                connectionObj.stream.close()
                return fileId
            } catch (e) {
                console.log(e)
                throw new Error((e as Error).message)
            }
        },
        async receiveFile(id: FileId) {
            try {
                const connectionObj = await _getStreamConnection()
                const meta = await FileProtocol.receiveMeta({connection: connectionObj, id})
                const connectionObj2 = await _getStreamConnection()
                const source = FileProtocol.receiveContent({connection: connectionObj2, id})
                const content: Array<Uint8Array> = [];
                for await (const chunk of source) {
                    content.push(Uint8Array.from(chunk));
                }
                const blob = new Blob(content, {type: meta.type})
                connectionObj.stream.close()
                connectionObj2.stream.close()
                return new File([blob], meta.name, {type: meta.type, lastModified: meta.lastModified});
            } catch (e) {
                throw Error((e as Error).message)
            }

        },
        async receiveStreamFile(id: FileId) {
            try {
                const connectionObj = await _getStreamConnection()
                const meta = await FileProtocol.receiveMeta({connection: connectionObj, id})
                const connectionObj2 = await _getStreamConnection()
                const source = FileProtocol.receiveContent({connection: connectionObj2, id})
                return {source, meta};
            } catch (e) {
                throw Error((e as Error).message)
            }

        },
        async receiveMeta(id: string) {
            try {
                const connectionObj = await _getStreamConnection()
                const meta: SchemaProtocol.Meta = await FileProtocol.receiveMeta({connection: connectionObj, id});
                connectionObj.stream.close()
                return meta;
            } catch (e) {
                throw new Error((e as Error).message)
            }
        },
        getNode() {
            return node;
        },
        close() {
            node.stop()
        }
    };
}
