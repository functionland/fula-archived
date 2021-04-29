import Libp2p from 'libp2p';
import Bootstrap from 'libp2p-bootstrap';
import wrtc from 'wrtc';
import Websockets from 'libp2p-websockets';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
import PeerId from 'peer-id';
import pipe from 'it-pipe';

async function main() {
  const peerId = await PeerId.createFromJSON({
    id: '12D3KooWP9j4Cp8hEbMMxLuKYZ8RvXuBi81QneULrawgRo8HTD3x',
    privKey:
      'CAESQMphNCAzixg/7chz+LttzqbtqzvyJda/NtXRMBx0H2vPxh2VK3wSYYh1fQ5JhVs1AeClU4wUl6RjApkN30cSCUs=',
    pubKey: 'CAESIMYdlSt8EmGIdX0OSYVbNQHgpVOMFJekYwKZDd9HEglL',
  });
  const node = await Libp2p.create({
    peerId,
    addresses: {
      listen: [
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws',
        `/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star/`
      ]
    },
    modules: {
      transport: [Websockets, WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
    },
    config: {
      transport: {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc // You can use `wrtc` when running in Node.js
        },
      },
      peerDiscovery: {
        [Bootstrap.tag]: {
          enabled: true,
          list: [
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
          ]
        }
      }
    }
  });

  node.connectionManager.on('peer:connect', connection => {
    console.log(`Connected to ${connection.remotePeer.toB58String()}!`);
  });

  await node.handle('/chat', async ({stream}) => {
    pipe(
      stream,
      async function (source) {
        for await (const message of source) {
          console.log(message)
        }
      }
    )
  });

  await node.start();

  console.log('Listening on:');
  node.multiaddrs.forEach(ma =>
    console.log(`${ma.toString()}/p2p/${node.peerId.toB58String()}`)
  );
}

main();
