// @ts-ignore
import Websockets from 'libp2p-websockets';
// @ts-ignore
import filters from 'libp2p-websockets/src/filters';
// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
// @ts-ignore
import { NOISE, Noise } from "@chainsafe/libp2p-noise"
// @ts-ignore
import Mplex from 'libp2p-mplex';
// @ts-ignore
import PeerId from 'peer-id';

const noise = new Noise();

export async function configure(config = {}): Promise<any> {
  const peerId = await PeerId.create({ bits: 2048, keyType: 'Ed25519' })
  return {
    addresses: {
      listen: [
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
      ],
    },
    peerId,
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
