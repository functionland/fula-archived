import Libp2p, { Connection as LpConnection } from "libp2p"
import {EventEmitter} from "events"
import PeerId from "peer-id";
import {SIG_MULTIADDRS} from "./constant";

export interface ConnectionEvents {
    'connected':(lpConnection:LpConnection)=> void,
    'disconnected':()=> void,
    'status':(status:Status)=>void,
    'error':(message:string) => void
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


export class Connection extends EventEmitter {
    status: Status
    libp2p:Libp2p;
    serverPeerId:PeerId;
    lpConnection:LpConnection|null=null;
    ready = false
    wait:any = null;
    ee;

    constructor(libp2p: Libp2p, peerId: PeerId) {
        super();
        this.status = Status.Offline
        this.libp2p = libp2p
        this.serverPeerId = peerId
        this.ee = this.libp2p.connectionManager.on('peer:disconnect', this._reconnect)
    }

    _reconnect = async (connection: LpConnection) => {
        console.log('call reconnect')
        if(!this.wait && this.status !== Status.Connecting && this.lpConnection && this.lpConnection.remotePeer === connection.remotePeer){
            this.status = Status.Offline
            this.emit('disconnected')
            this.emit('status',(Status.Offline))
            await this._connect()
        }
    }

    start = () => {
        this._connect()
        this.ready = true;
    }

    _connect = async (option:{num_try:number, sleep:number}={num_try:5, sleep:5000})=>{
        this.status = Status.Connecting
        this.emit('status',(Status.Connecting))
        try{
            this.serverPeerId = await this.addToPeerStore(this.serverPeerId)
            this.lpConnection = await this.libp2p.dial(this.serverPeerId)
            this.status = Status.Online
            this.emit('status',(Status.Online))
            this.emit('connected',this.lpConnection)
        }
        catch (e) {
            this.emit('error', ((e as Error).message))
            this.emit('disconnected')
            this.emit('status',(Status.Offline))
            this.wait = !this.wait && setTimeout(()=>{
                this.wait = null;
                if(option.num_try>0){
                    this._connect({
                        num_try:option.num_try-1,
                        sleep:option.sleep*1.2
                    })
                }else {
                    this._connect()
                }
            },option.num_try===0?60000:option.sleep)
        }
    }

    addToPeerStore = async (serverPeer:PeerId) => {
        await this.libp2p.peerStore.addressBook.set(serverPeer, SIG_MULTIADDRS)
        return serverPeer
    }

    close = async () => {
        if(this.ee)
            this.ee.removeAllListeners()
        if(this.wait)
            clearTimeout(this.wait)
        if(this.lpConnection)
            await this.lpConnection.close()
        this.emit('disconnected')
        this.emit('status',(Status.Offline))
    }

}


