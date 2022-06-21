import {networkInterfaces} from "os";


const nets = networkInterfaces();
const ips = []; // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
    if (net.family === familyV4Value && !net.internal) {
      if (net.address)
        ips.push(net.address);
    }
  }
}

export const printSwarm = (peerId, multiaddrs) => {
  for (const ma of multiaddrs) {
    if (ma.toString().includes('0.0.0.0')) {
      for (const localip of ips) {
        console.log(`Swarm listening on ${ma.toString().replace('0.0.0.0', localip)}/p2p/${peerId.toB58String()}`)}
    } else {
      console.log(`Swarm listening on ${ma.toString()}/p2p/${peerId.toB58String()}`)
    }
  }
  console.log(ips)
}
