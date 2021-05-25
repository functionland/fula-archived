import Libp2p from 'libp2p';
import Bootstrap from 'libp2p-bootstrap';
import wrtc from 'wrtc';
import Websockets from 'libp2p-websockets';
import filters from 'libp2p-websockets/src/filters';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
import PeerId from 'peer-id';
import pipe from 'it-pipe';
import ipfs from 'ipfs';
import Repo from 'ipfs-repo';
import type { Config as IPFSConfig } from 'ipfs-core-types/src/config';
import IPFS from 'ipfs-core/src/components'
import { FileProtocol } from '@functionland/protocols';
import {resolveLater} from './utils';

const [libp2pPromise, resolveLibp2p] = resolveLater<Libp2p>();
const [ipfsPromise, resolveIpfs] = resolveLater<IPFS>();

export async function getLibp2p() {
  return libp2pPromise;
}

export async function getIPFS() {
  return ipfsPromise;
}

async function main() {
  const createLibp2 = ({peerId, config}: {peerId: PeerId, config: IPFSConfig}) => {
    resolveLibp2p(Libp2p.create({
    peerId,
    addresses: {
      listen: [
        // '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        // '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        // '/ip4/0.0.0.0/tcp/0',
        // '/ip4/0.0.0.0/tcp/0/ws',
        `/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star/`,
        // `/ip4/3.14.71.57/tcp/9090/ws/p2p-webrtc-star/`,
        // '/dns4/server.fx.land/tcp/9090/ws/p2p-webrtc-star/',
        // '/dns4/server.fx.land/tcp/443/wss/p2p-webrtc-star/',
      ]
    },
    modules: {
      transport: [Websockets, WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
    },
    config: {
      transport: {
        [Websockets.prototype[Symbol.toStringTag]]: {
          filter: filters.all
        },
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc // You can use `wrtc` when running in Node.js
        },
      },
      peerDiscovery: {
        [Bootstrap.tag]: {
          enabled: true,
          list: config.Bootstrap
        }
      }
    }
  }));
  return libp2pPromise
}

  resolveIpfs(ipfs.create({
    libp2p: createLibp2,
    repo: new Repo('./.ipfs')
  }));

  const node = await libp2pPromise;

  node.connectionManager.on('peer:connect', connection => {
    console.log(`Connected to ${connection.remotePeer.toB58String()}!`);
  });

  await node.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);

  // Set up our input handler
  process.stdin.on('data', (message) => {
    // remove the newline
    message = message.slice(0, -1)
    // Iterate over all peers, and send messages to peers we are connected to
    node.peerStore.peers.forEach(async (peerData) => {
      // If they dont support the chat protocol, ignore
      if (!peerData.protocols.includes(FileProtocol.PROTOCOL)) return

      // If we're not connected, ignore
      const connection = node.connectionManager.get(peerData.id)
      if (!connection) return

      try {
        const { stream } = await connection.newStream([FileProtocol.PROTOCOL])        
        await pipe(
          [ message ],
          stream,
          async function (source) {
            for await (const message of source) {
              console.info(String(message))
            }
          }
        )
      } catch (err) {
        console.error('Could not negotiate chat protocol stream with peer', err)
      }
    })
  })
}

async function graceful() {
  console.log("\nStopping server...");
  const ipfs = await getIPFS();
  await ipfs.stop()
  process.exit(0);
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);

main();