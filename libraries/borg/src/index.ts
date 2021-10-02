// import "core-js"
// @ts-ignore
import {FileProtocol} from '@functionland/protocols';
// @ts-ignore
import {configure} from './config';
// @ts-ignore
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import type {Connection} from "libp2p";
import 'fastestsmallesttextencoderdecoder';


export async function client(config?: any) {
    let node: Libp2p;
    let conf: any;
    let serverPeer: PeerId;
    let connection: Connection;
    let nodePeerId: PeerId;

    if (config) conf = await configure(config);
    else conf = await configure();
    nodePeerId = conf.PeerId;
    node = await Libp2p.create(conf);
    node.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);
    await node.start();

    return {
        async connect(peer: string) {
            let serverPeerId = await PeerId.createFromB58String(peer)
            let remoteMultiaddr = node.peerStore.addressBook.getMultiaddrsForPeer(serverPeerId)
            if (remoteMultiaddr && remoteMultiaddr.length>0){
                // @ts-ignore
                serverPeer = remoteMultiaddr[0]
                // @ts-ignore
            } else serverPeer = remoteMultiaddr
            if (serverPeer){
                console.log(serverPeer)
                connection = await node.dial(serverPeer)
            }
        },
        async sendFile(file: any): Promise<string> {
            if (!serverPeer) {
                throw 'ServerPeer not found';
            }
            const id = await FileProtocol.sendFile({to: serverPeer, node, file});
            return id;
        },
        async receiveFile(id: string) {
            if (!serverPeer) {
                throw 'ServerPeer not found';
            }
            let content = '';
            const decoder = new TextDecoder();
            for await (const chunk of FileProtocol.receiveContent({from: serverPeer, node, id})) {
                content += decoder.decode(chunk);
                console.log(content);
            }
            return content;
        },
        async receiveMeta(id: string) {
            if (!serverPeer) {
                throw 'ServerPeer not found';
            }
            let content = '';
            const meta = await FileProtocol.receiveMeta({from: serverPeer, node, id});
            content = JSON.stringify(
                {
                    ...meta,
                    size: Number(meta.size),
                    lastModified: Number(meta.lastModified),
                },
                null,
                2
            );
            return content;
        },
        async connectionHandler(handlerName: string | symbol, handler: (...args: any[]) => void) {
            node.connectionManager.on(handlerName, handler);
        },
        async nodeHandler(handlerName: string | symbol, handler: (...args: any[]) => void) {
            node.on(handlerName, handler);
        }
    };
}
