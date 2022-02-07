import Libp2p from 'libp2p';
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
import wrtc from 'wrtc';
import Mplex from 'libp2p-mplex';
import Protector from "libp2p/src/pnet"
import * as fs from 'fs';

new Noise();
const swarmKey1 = fs.readFileSync('.ipfs/sw.key')
console.log(swarmKey1)
export const createClient = async () =>{
    const node = await Libp2p.create({
        addresses: {
            listen: [
                '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
            ]
        },
        modules: {
            transport: [WebRTCStar],
            streamMuxer: [Mplex],
            connEncryption: [NOISE],
            connProtector:new Protector(swarmKey1)
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
