import type {SchemaProtocol} from "@functionland/file-protocol";
import {FileProtocol} from '@functionland/file-protocol';
import {
  PROTOCOL as GRAPH_PROTOCOL,
  Request,
  Result,
  submitQuery,
  submitSubscriptionQuery
} from '@functionland/graph-protocol'
import {configure} from './config';
import Libp2p, {constructorOptions, Libp2pOptions} from 'libp2p';
import {Connection, Status} from "./connection"
import debug from "debug";
import PeerId from "peer-id";

debug.disable()


// types
declare type FileId = string

export {Connection, Status}

export interface Fula {
  connect: (peerId: string) => Connection
  disconnect: () => Promise<void>
  sendFile: (file: File) => Promise<FileId>
  sendStreamFile: (source: AsyncIterable<Uint8Array>, meta: SchemaProtocol.Meta) => Promise<FileId>
  receiveFile: (fileId: FileId) => Promise<File>
  receiveStreamFile: (fileId: FileId) => Promise<{ source: AsyncIterable<Uint8Array>, meta: SchemaProtocol.Meta }>
  receiveMeta: (fileId: FileId) => Promise<SchemaProtocol.Meta>
  graphql: (query: string, variableValues?: never, operationName?: string) => Promise<unknown>
  graphqlSubscribe: (query: string, variableValues?: never, operationName?: string) => AsyncIterable<unknown>
  getNode: () => Libp2p
  close: () => Promise<void>
}

// end of types

export async function createClient(config?: Partial<Libp2pOptions & constructorOptions>, pKey = undefined): Promise<Fula> {
  const conf = await configure(config, pKey);
  const node = await Libp2p.create(conf);
  let connection: undefined | Connection = undefined;
  node.handle(FileProtocol.PROTOCOL, FileProtocol.handler);
  await node.start();

  const _getStreamConnection = async (protocol?: string) => {
    if (!node) {
      throw Error('node not ready')
    } else if (!connection || !connection.serverPeerId) {
      throw Error('peer id of th Box not set')
    } else if (!connection || connection.status === Status.Offline || !connection.lpConnection) {
      throw Error('Server Unreachable')
    } else if (protocol) {
      return await connection.lpConnection.newStream(protocol)
    } else
      return await connection.lpConnection.newStream(FileProtocol.PROTOCOL)
  }

  return {
    connect(peer: string) {
      const serverPeer = PeerId.createFromB58String(peer)
      if (serverPeer) {
        connection = new Connection(node, serverPeer)
        connection.start()
        return connection
      } else throw Error('Id it not in right format')
    },
    async disconnect() {
      await connection?.close()
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
    async graphql(query: string, _variableValues?: never, _operationName?: string) {
      try {
        const variableValues = _variableValues ? _variableValues : null
        const operationName = _operationName ? _operationName : null
        const connectionObj = await _getStreamConnection(GRAPH_PROTOCOL)
        const req = Request.fromJson({
          query,
          variableValues,
          operationName
        })
        const res = await submitQuery({connection: connectionObj, req});
        connectionObj.stream.close()
        return Result.toJson(<Result>res);
      } catch (e) {
        throw new Error((e as Error).message)
      }
    },
    graphqlSubscribe: async function* (query: string, _variableValues?: never, _operationName?: string) {
      try {
        const variableValues = _variableValues ? _variableValues : null
        const operationName = _operationName ? _operationName : null
        const connectionObj = await _getStreamConnection(GRAPH_PROTOCOL)
        const req = Request.fromJson({
          query,
          variableValues,
          operationName,
          subscribe: true
        })
        const res = await submitSubscriptionQuery({connection: connectionObj, req})

        for await(const newRes of res)
          yield Result.toJson(<Result>newRes)
      } catch (e) {
        throw new Error((e as Error).message)
      }
    },
    getNode() {
      return node;
    },
    async close() {
      if (connection)
        await connection.close()
      await node.stop()
    }
  };
}
