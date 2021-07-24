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
import IPFS from 'ipfs-core/src/components';
import { FileProtocol } from '@functionland/protocols';
import { resolveLater, asyncIterableFromObservable } from '@functionland/protocols/util';
import { File as FileSchema } from '@functionland/protocols/file/schema';
// import { createMessage, readMessage, encrypt, decrypt } from 'openpgp';
import { map } from 'streaming-iterables';

const [libp2pPromise, resolveLibp2p] = resolveLater<Libp2p>();
const [ipfsPromise, resolveIpfs] = resolveLater<IPFS>();

export async function getLibp2p() {
  return libp2pPromise;
}

export async function getIPFS() {
  return ipfsPromise;
}

async function main() {
  const createLibp2 = ({ peerId, config }: { peerId: PeerId; config: IPFSConfig }) => {
    resolveLibp2p(
      Libp2p.create({
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
          ],
        },
        modules: {
          transport: [Websockets, WebRTCStar],
          streamMuxer: [Mplex],
          connEncryption: [NOISE],
        },
        config: {
          transport: {
            [Websockets.prototype[Symbol.toStringTag]]: {
              filter: filters.all,
            },
            [WebRTCStar.prototype[Symbol.toStringTag]]: {
              wrtc, // You can use `wrtc` when running in Node.js
            },
          },
          peerDiscovery: {
            [Bootstrap.tag]: {
              enabled: true,
              list: config.Bootstrap,
            },
          },
        },
      })
    );
    return libp2pPromise;
  };

  resolveIpfs(
    ipfs.create({
      // @ts-ignore
      libp2p: createLibp2,
      repo: new Repo('./.ipfs'),
    })
  );

  const libp2pNode = await getLibp2p();
  const ipfsNode = await getIPFS();

  libp2pNode.connectionManager.on('peer:connect', connection => {
    console.log(`Connected to ${connection.remotePeer.toB58String()}!`);
  });

  libp2pNode.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);

  async function handleMeta(_id: string) {}

  FileProtocol.setRetrievalMethod(async ({ id }) => {
    for await (const chunk of ipfsNode.cat(id)) {
      const { contentPath } = FileSchema.fromBinary(chunk);
      return ipfsNode.cat(contentPath);
    }
  });

  FileProtocol.incomingFiles.subscribe(async ({ content, meta, declareId }) => {
    const { cid: file } = await ipfsNode.add(
      // map(
      //   async (bytes: Uint8Array) =>
      //     encrypt({
      //       message: await createMessage({ binary: bytes }),
      //       passwords: ['weeeee weeee'],
      //       armor: false,
      //     }),
      //   asyncIterableFromObservable(content)
      // )

      asyncIterableFromObservable(content)
    );
    for await (const chunk of ipfsNode.cat(file)) {
      console.log(String(chunk));
    }
    const { cid } = await ipfsNode.add(FileSchema.toBinary({ contentPath: file.toString(), meta }));
    console.log('done');
    declareId(cid.toString());
    const cat = async cid => {
      for await (const chunk of ipfsNode.cat(cid)) {
        console.log(FileSchema.fromBinary(chunk));
      }
    };
    const ls = async cid => {
      for await (const chunk of ipfsNode.ls(cid)) {
        console.log(chunk);
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
        await pipe([message], stream, async function (source) {
          for await (const message of source) {
            console.info(String(message));
          }
        });
      } catch (err) {
        console.error('Could not negotiate chat protocol stream with peer', err);
      }
    });
  });
}

async function graceful() {
  console.log('\nStopping server...');
  const ipfs = await getIPFS();
  await ipfs.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

main();
