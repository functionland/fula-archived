import GossipSub from "libp2p-gossipsub";
import wrtc from 'wrtc';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import {NOISE, Noise} from "@chainsafe/libp2p-noise"
import Bootstrap  from "libp2p-bootstrap"
import {Libp2pOptions} from "libp2p";
import Protector from "libp2p/src/pnet"
import config from "config"
import * as fs from "fs"
import peerId from "peer-id"
import {LIBP2P_PATH, FULA_NODES, IPFS_HTTP} from "./const";


const getPeerId = async () => {
    if (fs.existsSync(LIBP2P_PATH + '/identity.json')) {
        let identity = JSON.parse(fs.readFileSync(LIBP2P_PATH + '/identity.json'));
        return await peerId.createFromJSON(identity)
    } else {
        let identity = await peerId.create()
        fs.writeFileSync(LIBP2P_PATH + '/identity.json', JSON.stringify(identity.toJSON()))
        return identity
    }

}
const getNetSecret = ()=> {
    if(config.get("network.key_path")===""){
        return undefined
    }
    const key = fs.readFileSync(config.get("network.key_path"))
    return new Protector(key)
}
export const netSecret = getNetSecret()
export const listen = config.get("network.listen")

new Noise();

export const libConfig = async (config: Partial<Libp2pOptions>): Promise<Libp2pOptions> => {
    const conf = {
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
            connProtector: netSecret
        },
        config: {
            transport: {
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    wrtc, // You can use `wrtc` when running in Node.js
                },
            },
            peerDiscovery: {
                autoDial: true,
                [WebRTCStar.tag]: {
                    enabled: false,
                },
                [Bootstrap.tag]: {
                    list: FULA_NODES,
                    interval: 5000,
                    enabled: FULA_NODES.length > 0
                }
            },
        },
    }
    if(IPFS_HTTP){
        return {
            ...conf,
          peerId:await getPeerId()
        }
    }
    else return conf
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
    Bootstrap: FULA_NODES,
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
