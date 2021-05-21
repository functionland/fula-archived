import Libp2p from 'libp2p';
import multiaddr from 'multiaddr';
// import Bootstrap from 'libp2p-bootstrap';
import Websockets from 'libp2p-websockets';
import filters from 'libp2p-websockets/src/filters';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
import pipe from 'it-pipe';

export async function connect() {  
  const node = await Libp2p.create({
    addresses: {
      listen: [
        // '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        // '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        `/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star/`,
        // '/dns4/server.fx.land/tcp/443/wss/p2p-webrtc-star/'
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
      },
      // peerDiscovery: {
      //   [Bootstrap.tag]: {
      //     enabled: true,
      //     list: [
      //       '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
      //       '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
      //       '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
      //       '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
      //       '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
      //     ]
      //   }
      // }
    }
  })

  await node.start()

  return node;
}