import Libp2p, {constructorOptions, Libp2pOptions} from 'libp2p';
import wrtc from 'wrtc';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import {NOISE, Noise} from "@chainsafe/libp2p-noise"
import PeerId from 'peer-id';
import pipe from 'it-pipe';
import * as IPFS from 'ipfs';
import type { Config as IPFSConfig } from 'ipfs-core-types/src/config';
import { FileProtocol, SchemaProtocol } from '@functionland/file-protocol';
import { resolveLater } from 'async-later';
import OrbitDB from 'orbit-db';
import GossipSub from 'libp2p-gossipsub'
import debug from 'debug';


debug.enabled('*')


const [libp2pPromise, resolveLibp2p] = resolveLater<Libp2p>();
const [ipfsPromise, resolveIpfs] = resolveLater<IPFS.IPFS>();
const [orbitDBPromise, resolveOrbitDB] = resolveLater<OrbitDB>();

export async function getLibp2p() {
  return libp2pPromise;
}

export async function getIPFS() {
  return ipfsPromise;
}
export async function getOrbitDb(){
  return orbitDBPromise;
}
new Noise();

export async function main(config?:Partial<Libp2pOptions&constructorOptions>) {
  const peerId = await PeerId.create({bits:2048,keyType:'Ed25519'})
  const createLibp2 = ({ peerId, config }: { peerId: PeerId; config: IPFSConfig }) => {
    resolveLibp2p(
      Libp2p.create({
        peerId,
        addresses: {
          listen: [
            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
            '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          ],
        },
        modules: {
          transport: [WebRTCStar],
          streamMuxer: [Mplex],
          connEncryption: [NOISE],
          pubsub: GossipSub
        },
        config: {
          transport: {
            [WebRTCStar.prototype[Symbol.toStringTag]]: {
              wrtc, // You can use `wrtc` when running in Node.js
            },
          },
          peerDiscovery: {
            autoDial:false,
            [WebRTCStar.prototype[Symbol.toStringTag]]: {
              enabled: false,
            },
          },
        },
        ...config
      })
    );
    return libp2pPromise;
  };

  resolveIpfs(
    IPFS.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      libp2p: createLibp2,
      repo: './.ipfs',
      peerId: config?.peerId
    })
  );


  const libp2pNode = await getLibp2p();
  const ipfsNode = await getIPFS();

  resolveOrbitDB(OrbitDB.createInstance(ipfsNode));
  console.log('Initial OrbitDb....');
  const orbitDB= await getOrbitDb();

  libp2pNode.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);

  FileProtocol.setMetaRetrievalMethod(async ({ id }) => {
    for await (const file of ipfsNode.cat(id)) {
      const { meta } = SchemaProtocol.File.fromBinary(file);
      return meta;
    }
  });

  FileProtocol.setContentRetrievalMethod(async ({ id }) => {
    for await (const file of ipfsNode.cat(id)) {
      const { contentPath } = SchemaProtocol.File.fromBinary(file);
      return ipfsNode.cat(contentPath);
    }
  });

  FileProtocol.incomingFiles.subscribe(async ({ getContent, meta, declareId }) => {
    const { cid: file } = await ipfsNode.add(
      getContent()
    );
    const { cid } = await ipfsNode.add(SchemaProtocol.File.toBinary({ contentPath: file.toString(), meta }));
    debug('done');
    declareId(cid.toString());
    const cat = async cid => {
      for await (const chunk of ipfsNode.cat(cid)) {
        debug(SchemaProtocol.File.fromBinary(chunk).toString());
      }
    };
    const ls = async cid => {
      for await (const chunk of ipfsNode.ls(cid)) {
        debug(chunk.toString());
        chunk.type !== 'file' && (await ls(chunk.cid));
        chunk.type === 'file' && (await cat(chunk.cid));
      }
    };
    await ls(cid);
  });

  // Set up our input handler
  process.stdin.on('data', message => {
    // remove the newline
    message = message.slice(0, -1);
    // Iterate over all peers, and send messages to peers we are connected to
    libp2pNode.peerStore.peers.forEach(async peerData => {
      // If they dont support the chat protocol, ignore
      if (!peerData.protocols.includes(FileProtocol.PROTOCOL)) return;

      // If we're not connected, ignore
      const connection = libp2pNode.connectionManager.get(peerData.id);
      if (!connection) return;

      try {
        const { stream } = await connection.newStream([FileProtocol.PROTOCOL]);
        await pipe([message], stream);
      } catch (err) {
        debug('Could not negotiate chat protocol stream with peer', err);
      }
    });
  });
}

export async function graceful() {
  debug('\nStopping server...');
  const ipfs = await getIPFS();
  const orbitDB= await getOrbitDb();
  await orbitDB.stop();
  await ipfs.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);


