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
    store: Store
    lpConnection:LpConnection|null=null;
    ready = false
    hasServer = false;

    constructor(libp2p: Libp2p) {
        super();
        this.status = Status.Offline
        this.libp2p = libp2p
        this.store = new Store()
        const result = this.store.getServerId()
        if (result){
            this.hasServer = true;
            this.start()
        }
        this.libp2p.connectionManager.on('peer:disconnect', async (connection: LpConnection) => {
            if(this.hasServer && this.ready && this.status !== Status.Connecting && this.lpConnection && this.lpConnection.remotePeer === connection.remotePeer){
                this._connect()
            }
        })
    }

    setServer = async (serverId: string) => {
        this.store.setServerId(serverId)
        this.hasServer = true;
        this.start()
    }

    start = async () => {
        if(this.hasServer){
            await this.loadServer()
            this.ready = true
            this._connect()
        }
        else
            throw Error("Server not Set")
    }

    _connect = async (option:{num_try:number, sleep:number}={num_try:5, sleep:500})=>{
        this.status = Status.Connecting
        try{
            this.lpConnection = await this.libp2p.dial(this.serverPeerId as PeerId)
            this.status = Status.Online
            this.emit('connected',this.lpConnection)
        } catch (e) {
            this.status = Status.Offline
            setTimeout(()=>{
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

    loadServer = async () => {
        const serverId = this.store.getServerId()
        if(serverId){
            this.serverPeerId = await this.serverIdToPeerID(serverId);
        }
    }

    serverIdToPeerID = async (serverId:string) => {
        const _serverPeerId = PeerId.createFromB58String(serverId)
        await this.libp2p.peerStore.addressBook.set(_serverPeerId, SIG_MULTIADDRS)
        return _serverPeerId
    }

}



export class Store {

    serverId: null|string = null;

    constructor(id?:string) {
        if(id){
            this.setServerId(id)
        }else{
            this.serverId = localStorage.getItem("serverId")
        }
    }


    setServerId = (id:string)=>{
        localStorage.setItem("serverId",id)
        this.serverId = id
    }

    getServerId = ()=>{
        return this.serverId
    }
}
