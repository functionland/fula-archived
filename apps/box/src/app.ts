import Libp2p, {constructorOptions, Libp2pOptions} from 'libp2p';
import * as IPFS from 'ipfs';
import { resolveLater } from 'async-later';
import OrbitDB from 'orbit-db';
import debug from 'debug';
import {registerFile} from "./file";
import {libConfig, ipfsConfig} from "./config";
import {registerGraph} from "./graph";
import {IPFS_PATH, ORBITDB_PATH} from "./const";

debug.enabled('*')

type DBCollections = {[dbName: string]: any}


const [libp2pPromise, resolveLibp2p] = resolveLater<Libp2p>();
const [ipfsPromise, resolveIpfs] = resolveLater<IPFS.IPFS>();
const [orbitDBPromise, resolveOrbitDB] = resolveLater<OrbitDB>();
const [dbCollectionsPromise, resolveDBCollections] = resolveLater<DBCollections>();

export async function getLibp2p() {
  return libp2pPromise;
}

export async function getIPFS() {
  return ipfsPromise;
}

export async function getOrbitDb(){
  return orbitDBPromise;
}

export async function getDBCollections(): Promise<DBCollections>{
  return dbCollectionsPromise;
}


export async function app(config?:Partial<Libp2pOptions&constructorOptions>) {

  const createLibp2 = ( config: Libp2pOptions ) => {
    resolveLibp2p(
      Libp2p.create(libConfig(config))
    );
    return libp2pPromise;
  };
  resolveIpfs(
    IPFS.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      libp2p: createLibp2,
      repo: IPFS_PATH,
      peerId: config?.peerId,
      config: ipfsConfig()
    })
  );

  resolveDBCollections(new Promise(resolve => {
    const dbCollections = {}
    resolve(dbCollections)
  }))

  const libp2pNode = await getLibp2p();
  const ipfsNode = await getIPFS();

  resolveOrbitDB(OrbitDB.createInstance(ipfsNode, {directory: ORBITDB_PATH}));
  const orbitDB= await getOrbitDb();


  registerFile(libp2pNode,ipfsNode)
  registerGraph(libp2pNode, orbitDB)
  return {
    stop: async () => await graceful()
  }
}

export async function graceful() {
  debug('\nStopping server...');
  const ipfs = await getIPFS();
  const orbitDB= await getOrbitDb();
  const libp2p = await getLibp2p();
  await orbitDB.stop();
  await ipfs.stop();
  await libp2p.stop()
  return
  // process.exit(0);
}




