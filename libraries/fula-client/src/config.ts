// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
// @ts-ignore
import Mplex from 'libp2p-mplex';
import PeerId from 'peer-id';
import { constructorOptions, Libp2pOptions } from 'libp2p';
import { SIG_SERVER } from './constant';
import Protector from "libp2p/src/pnet"

const noise = new Noise();
const enc = new TextEncoder();
const stringSwKey = `/key/swarm/psk/1.0.0/
/base16/
5693ff3ca2f6c71a2773aacec4307d15cf496fe2ef8753507a28e7c14265a7bd`
const swkey = enc.encode(stringSwKey)

export async function configure(
  config = {}
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
      connProtector:new Protector(swkey)
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
