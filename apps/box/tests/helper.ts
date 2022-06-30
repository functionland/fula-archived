import wrtc from 'wrtc';
import {WebRTCStar} from '@libp2p/webrtc-star';
import {Mplex} from '@libp2p/mplex';
import {Noise} from "@chainsafe/libp2p-noise";
import {createLibp2p} from "libp2p";
import {FaultTolerance} from "libp2p/transport-manager";
import {createEd25519PeerId } from '@libp2p/peer-id-factory'
import {TCP} from '@libp2p/tcp';
import {WebSockets} from '@libp2p/websockets';
import {netSecret} from "../src/config";
import { Multiaddr } from '@multiformats/multiaddr';
import * as PeerId from '@libp2p/peer-id'

export const createClient = async () =>{
    const node = await createLibp2p({
        peerId: await createEd25519PeerId(),
        connectionProtector: netSecret,
        transportManager: {
            faultTolerance: FaultTolerance.NO_FATAL
        },
        connectionManager: {
            autoDial: false
        },
        transports: [new WebRTCStar({wrtc}), new TCP(), new WebSockets()],
        connectionEncryption: [new Noise()],
        streamMuxers: [new Mplex()],
    });
    await node.start()
    return node
}


export const connect =async (clientNode, boxNode) => {
    clientNode.peerStore.addressBook.set(boxNode.peerId, boxNode.getMultiaddrs());
    return await clientNode.dial(await boxNode.peerId);
}
