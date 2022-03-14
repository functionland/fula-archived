import Libp2p, { Connection as LpConnection } from "libp2p"
import events from "events"
import PeerId from "peer-id";
import {SIG_MULTIADDRS} from "./constant";

export interface ConnectionEvents {
    'connected':(lpConnection:LpConnection)=> void,
    'disconnected':()=> void
}

export enum Status{Online,Offline,Connecting}

export declare interface Connection {

    on<U extends keyof ConnectionEvents>(
        event: U, listener: ConnectionEvents[U]
    ): this;

    emit<U extends keyof ConnectionEvents>(
        event: U, ...args: Parameters<ConnectionEvents[U]>
    ): boolean;
}


export class Connection extends events.EventEmitter {
    status: Status
    libp2p:Libp2p;
    serverPeerId:PeerId|null=null;
    serverId:string
    lpConnection:LpConnection|null=null;
    ready = false
    wait = null;
    ee;

    constructor(libp2p: Libp2p, peerId: string) {
        super();
        this.status = Status.Offline
        this.libp2p = libp2p
        this.serverId = peerId
        this.ee = this.libp2p.connectionManager.on('peer:disconnect', this._reconnect)
    }

    _reconnect = async (connection: LpConnection) => {
        if(this.ready && this.status !== Status.Connecting && this.lpConnection && this.lpConnection.remotePeer === connection.remotePeer){
            this.emit('disconnected')
            await this._connect()
        }
    }

    start = async () => {
        this.serverPeerId = await this._serverIdToPeerID(this.serverId)
        this.ready = true;
        await this._connect()

    }

    _connect = async (option:{num_try:number, sleep:number}={num_try:5, sleep:5000})=>{
        this.status = Status.Connecting
        try{
            this.lpConnection = await this.libp2p.dial(this.serverPeerId as PeerId)
            this.status = Status.Online
            this.emit('connected',this.lpConnection)
        }
        catch (e) {
            this.status = Status.Offline
            this.wait = this.wait && setTimeout(()=>{
                if(option.num_try>0){
                    this._connect({
                        num_try:option.num_try-1,
                        sleep:option.sleep*1.2
                    })
                }else {
                    this._connect()
                    this.wait = null;
                }
            },option.num_try===0?60000:option.sleep)
        }
    }

    _serverIdToPeerID = async (serverId:string) => {
        const _serverPeerId = PeerId.createFromB58String(serverId)
        await this.libp2p.peerStore.addressBook.set(_serverPeerId, SIG_MULTIADDRS)
        return _serverPeerId
    }

    close = () => {
        if(this.ee)
            this.ee.removeAllListeners()
        if(this.wait)
            clearTimeout(this.wait)
        if(this.lpConnection)
            this.lpConnection.close()
    }

}


