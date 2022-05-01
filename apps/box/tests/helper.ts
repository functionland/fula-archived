import Libp2p from 'libp2p';
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
import wrtc from 'wrtc';
import Mplex from 'libp2p-mplex';
import {listen,netSecret} from "../src/config";

new Noise();

export const createClient = async () =>{
    const node = await Libp2p.create({
        addresses: {
            listen
        },
        modules: {
            transport: [WebRTCStar],
            streamMuxer: [Mplex],
            connEncryption: [NOISE],
            connProtector:netSecret
        },
        config: {
            transport: {
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    wrtc // You can use `wrtc` when running in Node.js
                }
            },
            peerDiscovery: {
                autoDial: false,
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    enabled: false
                }
            }
        }
    });
    await node.start()
    return node
}


export const connect =async (clientNode, boxNode) => {
    clientNode.peerStore.addressBook.set(boxNode.peerId, boxNode.multiaddrs);
    return await clientNode.dial(await boxNode.peerId);
}
