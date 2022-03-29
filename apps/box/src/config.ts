import GossipSub from "libp2p-gossipsub";
import wrtc from 'wrtc';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import {NOISE, Noise} from "@chainsafe/libp2p-noise"
import Bootstrap  from "libp2p-bootstrap"
import {Libp2pOptions} from "libp2p";
import Protector from "libp2p/src/pnet"
import config from "config"
import {createHash} from 'crypto';

const hash = createHash('sha256')
const nodes = config.get("nodes")
const getNetSecret = ()=> {
    if(!config.get("network.private")){
        return undefined
    }
    hash.update(config.get("network.secret"))
    const psk = hash.digest('hex')
    const key = '/key/swarm/psk/1.0.0/\n/base16/\n' + psk
    return new Protector(new TextEncoder().encode(key))
}
export const netSecret = getNetSecret()
export const listen = config.get("network.listen")

new Noise();

export const libConfig = (config: Partial<Libp2pOptions>): Libp2pOptions => {
    return {
        ...config,
        addresses: {
            listen
        },
        modules: {
            transport: [WebRTCStar],
            streamMuxer: [Mplex],
            connEncryption: [NOISE],
            peerDiscovery: [Bootstrap],
            pubsub: GossipSub,
            connProtector:netSecret
        },
        config: {
            transport: {
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    wrtc, // You can use `wrtc` when running in Node.js
                },
            },
            peerDiscovery: {
                autoDial: false,
                [WebRTCStar.tag]: {
                    enabled: false,
                },
                [Bootstrap.tag]: {
                      list: nodes,
                      interval: 5000,
                      enabled: nodes.length > 0
                }
            },
        },
    }
}

export const ipfsConfig = () => ({
    Addresses: {
        Swarm: [
            '/ip4/0.0.0.0/tcp/4002',
            '/ip4/127.0.0.1/tcp/4003/ws'
        ],
        Announce: [],
        NoAnnounce: [],
        API: '/ip4/127.0.0.1/tcp/5002',
        Gateway: '/ip4/127.0.0.1/tcp/9090',
        RPC: '/ip4/127.0.0.1/tcp/5003',
    },
    Discovery: {
        MDNS: {
            Enabled: true,
            Interval: 10
        },
        webRTCStar: {
            Enabled: false
        }
    },
    Bootstrap: nodes,
    Pubsub: {
        /** @type {'gossipsub'} */
        Router: ('gossipsub'),
        Enabled: true
    },
    Swarm: {
        ConnMgr: {
            LowWater: 1,
            HighWater: 10
        },
        DisableNatPortMap: false
    },
    Routing: {
        Type: 'dhtclient'
    }
})
