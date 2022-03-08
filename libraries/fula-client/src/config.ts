// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Mplex from 'libp2p-mplex';
import PeerId from 'peer-id';
import { constructorOptions, Libp2pOptions } from 'libp2p';
import { SIG_SERVER } from './constant';
import Protector from "libp2p/src/pnet/index.js"

const noise = new Noise();

export async function configure(
  config = {}, pKey=undefined
): Promise<Libp2pOptions & constructorOptions> {
  const peerId = await PeerId.create({ bits: 2048, keyType: 'Ed25519' });
  return {
    addresses: {
      listen: SIG_SERVER
    },
    peerId,
    modules: {
      transport: [WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      connProtector: pKey?new Protector(pKey):undefined
    },
    config: {
      peerDiscovery: {
        autoDial: false,
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          enabled: false
        }
      }
    },
    ...config
  };
}
