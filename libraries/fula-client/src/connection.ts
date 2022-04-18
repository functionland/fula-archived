import Libp2p, { Connection } from "libp2p"
import {EventEmitter} from "events"
import PeerId from "peer-id";
import {SIG_MULTIADDRS} from "./constant";

export interface ConnectionEvents {
    'connected':(lpConnection:Connection)=> void,
    'disconnected':()=> void,
    'status':(status:Status)=>void,
    'error':(message:string) => void
}

export enum Status{Online,Offline,Connecting}

export declare interface FulaConnection {

    on<U extends keyof ConnectionEvents>(
        event: U, listener: ConnectionEvents[U]
    ): this;

    emit<U extends keyof ConnectionEvents>(
        event: U, ...args: Parameters<ConnectionEvents[U]>
    ): boolean;
}


export class FulaConnection extends EventEmitter {
    status: Status
    libp2p:Libp2p;
    boxPeerIds:PeerId[];
    ready = false
    connect_listener;
    disconnect_listener;

    constructor(libp2p: Libp2p, peerIds: PeerId[]) {
        super();
        this.status = Status.Offline
        this.libp2p = libp2p
        this.boxPeerIds = peerIds
        this.libp2p.on('error', (err) => {
            console.log(err)
        })
        this.disconnect_listener = this.libp2p.connectionManager.on('peer:disconnect', (connection)=>{
            setTimeout(() => {
                if(this.libp2p.connectionManager.size===0){
                    this.status = Status.Connecting
                    this.emit('status', this.status)
                }
            },100)

        })
        this.connect_listener = this.libp2p.connectionManager.on('peer:connect', (connection) => {
            setTimeout(()=>{
                if(this.libp2p.connectionManager.size>0){
                    this.status = Status.Online
                    this.emit('connected', connection)
                    this.emit('status', this.status)
                }
            },100)
        })
    }

    start = () => {
        this.boxPeerIds.map((peerId)=>{
            this.addToPeerStore(peerId)
        })
        if(!this.libp2p.connectionManager._started){
            this.libp2p.connectionManager.start()
        }
        this.status = Status.Connecting
        this.emit('status', this.status)
        this.ready = true;
    }

    getConnection(): null|Connection {
        const connections = this.libp2p.connectionManager.connections.values()
        const connection = connections.next().value
        if(connection && connection.length > 0){
            return connection[0] as Connection
        }
        return null
    }

    addToPeerStore = async (serverPeer:PeerId) => {
        await this.libp2p.peerStore.addressBook.set(serverPeer, SIG_MULTIADDRS)
        return serverPeer
    }

    removeFromPeerStore = async (serverPeer:PeerId) => {
        await this.libp2p.peerStore.delete(serverPeer)
        return serverPeer
    }

    stop = async () => {
        if(this.connect_listener)
            this.connect_listener.removeAllListeners()
        if(this.disconnect_listener)
            this.disconnect_listener.removeAllListeners()
        this.boxPeerIds.map((peerId)=>{
            this.removeFromPeerStore(peerId)
        })
        this.status = Status.Offline
        this.emit('status', this.status)
        await this.libp2p.connectionManager.stop()
    }

}


