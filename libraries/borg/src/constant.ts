import { Multiaddr } from 'multiaddr'

export const SIG_SERVER = [
    '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
    '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
]

export const SIG_MULTIADDRS = SIG_SERVER.map((item)=>{
    return new Multiaddr(item)
})
