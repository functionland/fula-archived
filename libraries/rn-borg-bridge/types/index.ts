import type {SchemaProtocol} from "../../../protocols/file";


export enum MessageType {
    RPCRequestStream = 0,
    RPCRequest = 1,
    RPCResponse = 2,
    StreamChunk = 3,
    Log = 4
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
    type: MessageType.Log
}

export interface RPC extends Message {
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
    type: MessageType.RPCResponse
}

export interface Chunk extends RPC {
    type: MessageType.StreamChunk
    meta: SchemaProtocol.Meta
    data: string
    status: ChunkStatusType
}
