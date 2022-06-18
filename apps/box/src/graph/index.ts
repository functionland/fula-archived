import {
  PROTOCOL,
  handler,
  setQueryResolutionMethod,
  Result,
  Request,
  setSubscriptionQueryResolutionMethod
} from "@functionland/graph-protocol";
import { createResolver } from "./gql-engine/orbit/orbit-resolvers";
import { executeAndSelect } from "./gql-engine";
import { parse } from "graphql";
import { iterateLater, toAsyncIterable } from "async-later";
import { ORBITDB_PATH } from "../const";
import OrbitDB from 'orbit-db';
import * as IPFS from "ipfs";
import { resolveLater } from "async-later";
import crypto from "crypto"


type DBCollections = { [dbName: string]: any }
type OrbitDBNode = any
type RequestCredentials = {
  userId: string,
  appId: string,
  clientId: string
}
const encoder = new TextEncoder()
const decoder = new TextDecoder()

const [orbitDBPromise, resolveOrbitDB] = resolveLater<OrbitDBNode>();

export async function getOrbitDb() {
  return orbitDBPromise;
}

export const registerGraph = async (libp2pNode, ipfsNode) => {
  libp2pNode.handle(PROTOCOL, handler);

  const orbitDBNode = await OrbitDB.createInstance(ipfsNode, { directory: ORBITDB_PATH })
  resolveOrbitDB(orbitDBNode)
  const resolvers = createResolver(orbitDBNode)
  const dbCollections: DBCollections = {}

  const sendDBName = async (message) => {
    try {
      const msgString = JSON.stringify(message)
      const messageBuffer = encoder.encode(msgString)
      await ipfsNode.pubsub.publish('open-dbs', messageBuffer)
    } catch (e) {
      throw (e)
    }
  }

  const handleDBNameReceived = async (msg) => {
    if (!msg.topicIDs.includes('open-dbs'))
      return
    const rawdata = decoder.decode(msg.data)
    const data = JSON.parse(rawdata)
    if (data.ROI && data.ROI === 'req') {
      await sendDBName({ list: [...Object.keys(dbCollections)], ROI: 'res' })
      return
    }
    for (const dbName of data.list) {
      if (!dbCollections[dbName]) {
        const db = await orbitDBNode.docs(dbName, options)
        await db.load()
      }
    }
  }

  await ipfsNode.pubsub.subscribe('open-dbs', handleDBNameReceived)
  await sendDBName({ ROI: 'req' })

  const options = {
    // Give write access to ourselves
    accessController: {
      write: ['*']
    }
  }

  const loadDB = (creds: RequestCredentials) => {
    const hashDBName = (dbName: string) => {
      const keyString = [creds.userId, creds.appId, creds.clientId, dbName].join('|||')
      return crypto.createHash('sha256').update(keyString).digest('hex')
    }
    return async (dbName: string) => {

      const hashedDBName = hashDBName(dbName)
      
      if (dbCollections[hashedDBName]) {
        return dbCollections[hashedDBName]
      } else {
        const db = await orbitDBNode.docs(hashedDBName, options)
        await db.load()
        dbCollections[hashedDBName] = db
        if (await ipfsNode.swarm.peers() > 0) {
          await sendDBName({ list: [...Object.keys(dbCollections)] })
          await new Promise(((resolve, reject) => {
            db.events.once('replicated',
              () => {
                resolve('done')
              }
            )
            setTimeout(() => {
              resolve('done')
            }, 1000)
          }))
        }
        return db
      }
    }
  }

  setQueryResolutionMethod(async function (req: Request) {

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { query, variableValues, operationName, creds } = Request.toJson(req)
      const gqlQuery = parse(query)
      const data = await executeAndSelect(gqlQuery, resolvers, variableValues, operationName, loadDB(creds))
      const s = Result.fromJson(data)
      const bytes = Result.toBinary(s)
      return bytes && toAsyncIterable([bytes]);
    } catch (e) {
      console.log(e)
    }

  }) 

  setSubscriptionQueryResolutionMethod(async function* (req: Request) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      const { query, variableValues, operationName, creds } = Request.toJson(req)

      const gqlQuery = parse(query)

      const [values, next, complete] = iterateLater()

      const data = await executeAndSelect(gqlQuery, resolvers, variableValues, operationName, loadDB(creds), next, true)
      const s = Result.fromJson(data)
      const bytes = Result.toBinary(s)

      yield bytes

      for await (const res of values) {
        const s = Result.fromJson(res)
        const bytes = Result.toBinary(s)

        yield bytes
      }
    } catch (e) {
      console.log(e)
    }

  })
}