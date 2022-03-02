import GossipSub from "libp2p-gossipsub";
import wrtc from 'wrtc';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import {NOISE, Noise} from "@chainsafe/libp2p-noise"
import {Libp2pOptions} from "libp2p";
import Protector from "libp2p/src/pnet"

const pKey = process.env.PKEY?process.env.PKEY:undefined

new Noise();

export const defConfig = (config: Partial<Libp2pOptions>): Libp2pOptions => {
    return {
        ...config,
        addresses: {
            listen: [
                '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
            ],
        },
        modules: {
            transport: [WebRTCStar],
            streamMuxer: [Mplex],
            connEncryption: [NOISE],
            pubsub: GossipSub,
            connProtector:pKey!==undefined?new Protector(pKey):undefined
        },
        config: {
            transport: {
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    wrtc, // You can use `wrtc` when running in Node.js
                },
            },
            peerDiscovery: {
                autoDial: false,
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    enabled: false,
                },
            },
        },
    }
}
