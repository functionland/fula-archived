import wrtc from 'wrtc';
import {WebRTCStar} from '@libp2p/webrtc-star';
import {Mplex} from '@libp2p/mplex';
import {Noise} from "@chainsafe/libp2p-noise";
import {Bootstrap} from "@libp2p/bootstrap";
import {Libp2pOptions} from "libp2p";
import {FaultTolerance} from "libp2p/transport-manager";
import { MulticastDNS } from '@libp2p/mdns'
import { PreSharedKeyConnectionProtector } from 'libp2p/pnet'
import type { PeerDiscovery } from '@libp2p/interfaces/peer-discovery'
import {LIBP2P_PATH, FULA_NODES, IPFS_HTTP, LISTENING, PKEY_PATH} from "./const";
import {createEd25519PeerId, createFromProtobuf, exportToProtobuf} from '@libp2p/peer-id-factory'
import {TCP} from '@libp2p/tcp';
import {WebSockets} from '@libp2p/websockets';
import {create as ipfsHttpClient} from "ipfs-http-client";
import {DelegatedPeerRouting} from '@libp2p/delegated-peer-routing';
import { KadDHT } from '@libp2p/kad-dht'
import * as fs from "fs";
import {getPublicIP} from "./utils";

const _ipfsHttpClient = ipfsHttpClient({url: new URL(IPFS_HTTP)})
const delegatedPeerRouting = new DelegatedPeerRouting(_ipfsHttpClient);

const getBootstrapNodes = async () => {
  const swarmAdders = await _ipfsHttpClient.swarm.addrs()
  const adder: string[] = []
  swarmAdders.map((ma)=>{
    ma.addrs.map((_ma)=>{
      const addrStr = `${_ma.toString()}/p2p/${ma.id}`
      adder.push(addrStr)
    })
  })
  return [...adder, ...FULA_NODES]
}

const getAnnounceAddr = async (identity) => {
  try{
    const publicIP = await getPublicIP();
    return [
      `/ip4/${publicIP}/tcp/4002/p2p/${identity.toString()}`,
      `/ip4/${publicIP}/tcp/4003/ws/p2p/${identity.toString()}`
    ]
  }catch (e){
    return []
  }
}
const getPeerId = async () => {
  if (fs.existsSync(LIBP2P_PATH + '/identity')) {
    const identity = fs.readFileSync(LIBP2P_PATH + '/identity');
    return await createFromProtobuf(identity)
  } else {
    const identity = await createEd25519PeerId()
    fs.writeFileSync(LIBP2P_PATH + '/identity', exportToProtobuf(identity))
    return identity
  }
}

const getNetSecret = ()=> {
    if(PKEY_PATH===""){
        return undefined
    }
    console.log("Private Mode Enabled")
    const key = fs.readFileSync(PKEY_PATH)
    return new PreSharedKeyConnectionProtector({enabled:true, psk:key})
}

export const netSecret = getNetSecret()


export const libConfig = async (fula_options: Partial<Libp2pOptions>) => {
  const discovery: PeerDiscovery[] = [] ;
  const peerId = await getPeerId()
  const boostrapNodes = await getBootstrapNodes()
  if(boostrapNodes.length>0){
    discovery.push(new Bootstrap({list: boostrapNodes, interval: 2000}))
  }
  discovery.push(new MulticastDNS({
    interval: 1000
  }))
  return {
    peerId,
    connectionProtector: netSecret,
    transportManager: {
      faultTolerance: FaultTolerance.NO_FATAL
    },
    connectionManager: {
      autoDial: false
    },
    dht: new KadDHT(),
    transports: [new WebRTCStar({wrtc}), new TCP(), new WebSockets()],
    connectionEncryption: [new Noise()],
    streamMuxers: [new Mplex()],
    addresses: {
      listen: LISTENING,
      // announce: [...advertise]
    },
    peerRouting: [
      delegatedPeerRouting
    ],
    relay: {                   // Circuit Relay options (this config is part of libp2p core configurations)
      enabled: true,           // Allows you to dial and accept relayed connections. Does not make you a relay.
      hop: {
        enabled: true,         // Allows you to be a relay for other peers
        active: true           // You will attempt to dial destination peers if you are not connected to them
      },
      advertise: {
        bootDelay: 15 * 60 * 1000, // Delay before HOP relay service is advertised on the network
        enabled: true,          // Allows you to disable the advertise of the Hop service
        ttl: 30 * 60 * 1000     // Delay Between HOP relay service advertisements on the network
      },
      autoRelay: {
        enabled: true,         // Allows you to bind to relays with HOP enabled for improving node dialability
        maxListeners: 2         // Configure maximum number of HOP relays to use
      }
    },
    peerDiscovery: discovery
  }
}
