import {SchemaProtocol} from "../../protocols/file";


export enum MessageType {
    RPCRequestStream,
    RPCRequest,
    RPCResponse,
    StreamChunk,
    Log
}

export enum RPCStatusType {
    done,
    failed,
}

export enum ChunkStatusType {
    START,
    CHUNK,
    END
}

export interface Message {
    type: MessageType
}

export interface Log extends Message {
    message: string;
    type: MessageType.LOG
}

export interface RPC extends Message{
    id: string;
}

export interface RPCRequest extends RPC {
    function: string
    args: Array<string>
    type: MessageType.RPCRequest | MessageType.RPCRequestStream
}

export interface RPCResponse extends RPC {
    payload: string
    status: RPCStatusType
    type: MessageType.RESPONSE
}

export interface Chunk extends RPC {
    type: MessageType.StreamChunk
    meta: SchemaProtocol.Meta
    data: string
    status: ChunkStatusType
}
