import Libp2p from 'libp2p';
import Bootstrap from 'libp2p-bootstrap';
import WebRTCDirect from 'libp2p-webrtc-direct';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
import PeerId from 'peer-id';

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
      listen: ['/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct'],
    },
    modules: {
      transport: [WebRTCDirect],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
    },
    config: {
      peerDiscovery: {
        [Bootstrap.tag]: {
          enabled: false,
        },
      },
    },
  });

  node.connectionManager.on('peer:connect', connection => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}!`);
  });

  await node.start();

  console.log('Listening on:');
  node.multiaddrs.forEach(ma =>
    console.log(`${ma.toString()}/p2p/${node.peerId.toB58String()}`)
  );
}

main();
