// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Mplex from 'libp2p-mplex';
import { constructorOptions, Libp2pOptions } from 'libp2p';
import { SIG_SERVER } from './constant';
import Protector from "libp2p/src/pnet/index.js"

const noise = new Noise();

export async function configure(
  config = {}, netSecret=undefined
): Promise<Libp2pOptions & Partial<constructorOptions>> {
  return {
    addresses: {
      listen: SIG_SERVER
    },
    modules: {
      transport: [WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      connProtector: netSecret?new Protector(netSecret):undefined
    },
    config: {
      peerDiscovery: {
        autoDial: false,
        [WebRTCStar.tag]: {
          enabled: false
        }
      }
    },
    connectionGater: {
      denyInboundConnection: async ()=> true
    },
    ...config
  };
}
