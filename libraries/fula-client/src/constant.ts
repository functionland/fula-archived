import { Multiaddr } from 'multiaddr';

export const SIG_SERVER = [
  '/dns4/wrtc1.fx.land/tcp/443/wss/p2p-webrtc-star',
];

export const SIG_MULTIADDRS = SIG_SERVER.map((item) => {
  return new Multiaddr(item);
});
