import type {SchemaProtocol} from "@functionland/file-protocol";
import {FileProtocol} from '@functionland/file-protocol';
import {
  PROTOCOL as GRAPH_PROTOCOL,
  Request,
  Result,
  submitQuery,
  submitSubscriptionQuery
} from '@functionland/graph-protocol'
import {configure, Option} from './config';
import Libp2p from 'libp2p';
import {FulaConnection, Status} from "./connection"
import debug from "debug";
import PeerId from "peer-id";
import aesjs from "aes-js";
import {File,Blob} from '@web-std/file'


// types
declare type FileId = string

export {FulaConnection, Status}

export interface Fula {
  connect: (peerIds: string[]|string) => FulaConnection
  disconnect: () => Promise<void>
  sendFile: (file: File) => Promise<FileId>
  sendEncryptedFile: (file: File) => Promise<{ cid: FileId, key: {symKey: Uint8Array, iv: Uint8Array}  }>
  sendStreamFile: (source: AsyncIterable<Uint8Array>, meta: SchemaProtocol.Meta) => Promise<FileId>
  receiveFile: (fileId: FileId) => Promise<File>
  receiveDecryptedFile: (fileId: FileId, symKey: Uint8Array, iv: Uint8Array) => Promise<File>
  receiveStreamFile: (fileId: FileId) => Promise<{ source: AsyncIterable<Uint8Array>, meta: SchemaProtocol.Meta }>
  receiveMeta: (fileId: FileId) => Promise<SchemaProtocol.Meta>
  graphql: (query: string, variableValues?: any, operationName?: string, userId?: string, appId?: string) => Promise<unknown>
  graphqlSubscribe: (query: string, variableValues?: any, operationName?: string, userId?: string, appId?: string) => AsyncIterable<unknown>
  getNode: () => Libp2p
  close: () => Promise<void>
}

// end of types

export async function createClient(option?:Option): Promise<Fula> {
  const conf = await configure(option);
  const node = await Libp2p.create(conf);

  let connection: undefined | FulaConnection = undefined;
  await node.handle(FileProtocol.PROTOCOL, FileProtocol.handler);

  await node.start();
  const _getStreamConnection = async (protocol?: string) => {
    if (!node) {
      throw Error('node not ready')
    } else if (!connection || connection.boxPeerIds.length===0) {
      throw Error('Peer id of th Box not set')
    } else if (!connection || connection.status === Status.Offline) {
      throw Error(`Server not Available, connection status: ${connection.status}`)
    }
    const conn = connection.getConnection()
    if(!conn){
      throw Error(`No Available Connection`)
    }
    if (protocol) {
      return await conn.newStream(protocol)
    } else
      return await conn.newStream(FileProtocol.PROTOCOL)
  }

  return {
    connect(peers: string[]|string) {
      let peerIds: PeerId[] = []
      if(Array.isArray(peers)){
        peerIds = peers.map((peer)=> PeerId.createFromB58String(peer))
      }
      if (typeof peers === 'string'){
        peerIds = peers.trim().split(',').map((peer)=> PeerId.createFromB58String(peer))
      }
      if (peerIds.length>0) {
        connection = new FulaConnection(node, peerIds)
        connection.start()
        return connection
      } else throw Error('Please insert a valid a Box address')
    },
    async disconnect() {
      await connection?.stop()
    },
    async sendFile(file) {
      try {
        const connectionObj = await _getStreamConnection()
        const fileId = await FileProtocol.sendFile({connection: connectionObj, file});
        connectionObj.stream.close()
        return fileId
      } catch (e) {
        throw new Error((e as Error).message)
      }
    },
    async sendEncryptedFile(file: File) {
      const randomKey = (len=32) => {
        const arr = []
        for(let i=0; i<len; i+=1)
          arr.push(Math.floor(Math.random() * 255))

        return new Uint8Array(arr)
      }
      try{
        const connectionObj = await _getStreamConnection()
        const key = {
          symKey: randomKey(),
          iv: randomKey(16)
        }
        const fileId = await FileProtocol.sendFile({connection: connectionObj, file, symKey: key.symKey, iv: key.iv})
        connectionObj.stream.close()
        return {cid: fileId, key}
      } catch (e) {
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
    async receiveDecryptedFile(id: FileId, symKey: Uint8Array, iv: Uint8Array){
      try {
        const connectionObj = await _getStreamConnection()
        const meta = await FileProtocol.receiveMeta({connection: connectionObj, id})
        const connectionObj2 = await _getStreamConnection()
        const source = FileProtocol.receiveContent({connection: connectionObj2, id})
        let content: Array<number> = [];
        for await (const chunk of source) {
          content = content.concat(Array.from(chunk));
        }

        const aescbc = new aesjs.ModeOfOperation.cbc(symKey, iv)
        const decBlob = aesjs.padding.pkcs7.strip(aescbc.decrypt(new Uint8Array(content)))

        connectionObj.stream.close()
        connectionObj2.stream.close()

        return new File([decBlob], meta.name, {type: meta.type, lastModified: meta.lastModified});
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
    async graphql(query: string, _variableValues?: any, _operationName?: string, userId: string = '', appId: string = '') {
      try {
        const variableValues = _variableValues ? _variableValues : null
        const operationName = _operationName ? _operationName : null
        const connectionObj = await _getStreamConnection(GRAPH_PROTOCOL)

        // @TODO use clientId based on a locally stored random string
        const req = Request.fromJson({
          query,
          variableValues,
          operationName,
          creds: {appId: appId, clientId: '', userId: userId}
        })
        const res = await submitQuery({connection: connectionObj, req});
        connectionObj.stream.close()
        return Result.toJson(<Result>res);
      } catch (e) {
        throw new Error((e as Error).message)
      }
    },
    graphqlSubscribe: async function* (query: string, _variableValues?: never, _operationName?: string, userId: string = '', appId: string = '') {
      try {
        const variableValues = _variableValues ? _variableValues : null
        const operationName = _operationName ? _operationName : null
        const connectionObj = await _getStreamConnection(GRAPH_PROTOCOL)
        const req = Request.fromJson({
          query,
          variableValues,
          operationName,
          subscribe: true,
          creds: {appId, userId, clientId: ''}
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
        await connection.stop()
      await node.stop()
    }
  }
}
