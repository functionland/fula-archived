import {createLibp2p as createNode, Libp2pOptions, Libp2p} from 'libp2p';
import {resolveLater} from 'async-later';
import debug from 'debug';
import {create, IPFSHTTPClient} from "ipfs-http-client";
import {printBoxListeningAddrs} from "./utils";
import {registerFile} from "./file";
import {libConfig} from "./config";
import {registerGraph, getOrbitDb} from "./graph";
import {IPFS_CLUSTER_PROXY} from "./const";


const [libp2pPromise, resolveLibp2p] = resolveLater<Libp2p>();
const [ipfsPromise, resolveIpfs] = resolveLater<IPFSHTTPClient>();

export async function getLibp2p() {
  return libp2pPromise;
}

export async function getIPFS() {
  return ipfsPromise;
}


const createLibp2p = async (conf) => {
  try {
    const cfg = await libConfig(conf)
    return createNode(cfg)
  } catch (e) {
    console.log(e);
  }

}

const createIPFSClusterProxy = async () => {
  if (!IPFS_CLUSTER_PROXY) {
    throw new Error('No IPFS cluster provided')
  }
  return new Promise<IPFSHTTPClient>(((resolve, reject) => {
    try {
      resolve(create({url: new URL(IPFS_CLUSTER_PROXY)}))
    } catch (e) {
      console.log(e)
      reject()
    }
  }))
}


export async function app(config?: Partial<Libp2pOptions>) {
  resolveLibp2p(
    createLibp2p(config)
  );
  resolveIpfs(
    createIPFSClusterProxy()
  )


  const libp2pNode = await getLibp2p();
  const ipfsNode = await getIPFS();
  await libp2pNode.start()
  console.log(libp2pNode.isStarted())
  console.log(`Box peerID: ${libp2pNode.peerId}`)
  printBoxListeningAddrs(libp2pNode.getMultiaddrs())
  await registerFile(libp2pNode, ipfsNode)
  await registerGraph(libp2pNode, ipfsNode)
  return {
    stop: async () => await graceful()
  }
}

export async function graceful() {
  debug('\nStopping server...');
  const libp2p = await getLibp2p();
  const otbitDb = await getOrbitDb();
  await otbitDb.stop();
  await libp2p.stop()
  return
  // process.exit(0);
}




