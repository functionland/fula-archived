import Libp2p, {constructorOptions, Libp2pOptions} from 'libp2p';
import * as IPFS from 'ipfs';
import { resolveLater } from 'async-later';
import debug from 'debug';
import {registerFile} from "./file";
import {libConfig, ipfsConfig} from "./config";
import {registerGraph, getOrbitDb} from "./graph";
import {IPFS_PATH, IPFS_HTTP} from "./const";
import config from "config";
import {create} from "ipfs-http-client";



const [libp2pPromise, resolveLibp2p] = resolveLater<Libp2p>();
const [ipfsPromise, resolveIpfs] = resolveLater<IPFS.IPFS>();

export async function getLibp2p() {
  return libp2pPromise;
}

export async function getIPFS() {
  return ipfsPromise;
}

async function createIPFS(createLibp2p){
  if(IPFS_HTTP){
    createLibp2p()
    const libp2pNode = await getLibp2p();
    await libp2pNode.start()
    return  new Promise<IPFS.IPFS>(((resolve, reject) => {
      try{
        resolve(create({url:new URL(IPFS_HTTP)}))
      }catch (e){
        console.log(e)
        reject()
      }
    }))
  }else {
    return IPFS.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      libp2p: createLibp2p,
      repo: IPFS_PATH,
      peerId: config?.peerId,
      config: ipfsConfig()
    })
  }
}


export async function app(config?:Partial<Libp2pOptions&constructorOptions>) {

  const createLibp2p = async (config: Libp2pOptions) => {
    resolveLibp2p(
      Libp2p.create(await libConfig(config))
    );
    return libp2pPromise;
  };
  resolveIpfs(
    createIPFS(createLibp2p)
  )


  const libp2pNode = await getLibp2p();
  const ipfsNode = await getIPFS();
  console.log('Box peerID: ' + libp2pNode.peerId.toB58String())


  registerFile(libp2pNode, ipfsNode)
  registerGraph(libp2pNode, ipfsNode)
  return {
    stop: async () => await graceful()
  }
}

export async function graceful() {
  debug('\nStopping server...');
  const ipfs = await getIPFS();
  const libp2p = await getLibp2p();
  const otbitDb = await getOrbitDb();
  await otbitDb.stop();
  if(!IPFS_HTTP)
    await ipfs.stop();
  await libp2p.stop()
  return
  // process.exit(0);
}




