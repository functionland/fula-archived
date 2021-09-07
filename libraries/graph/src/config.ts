import Websockets from 'libp2p-websockets'; // @ts-ignore
import filters from 'libp2p-websockets/src/filters'; // @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star'; // @ts-ignore
import { NOISE } from 'libp2p-noise'; // @ts-ignore
import Mplex from 'libp2p-mplex'; // @ts-ignore


export function configure(config={}): any {
  return {
    addresses: {
      listen: [`/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star/`],
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
      },
    },
    ...config,
  };
}
