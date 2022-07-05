import http from 'http';
import {create as ipfsHttpClient} from "ipfs-http-client";
import {IPFS_HTTP} from "./const";
import child_process from "child_process";
import {getLogger} from "./logger";

const log = getLogger()

export const getPublicIP = async () => {
  return new Promise<string>((resolve, reject) => {
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
      resp.on('data', function(ip) {
        console.log("My public IP address is: " + ip);
        resolve(ip.toString())
      });
      resp.on('error', (e)=>{
        reject('NO local address')
      })
    });
  })
}


export const printBoxListeningAddrs = (multiaddrs) => {
  for (const ma of multiaddrs) {
    log.info(`Box Listen On ${ma.toString()}`)
  }
}


export const connectWithBackOff = async (ipfs_http)=>{
  log.trace('Connecting to IPFS %s', ipfs_http)
  const limit = 100;
  let tryCount = 0;
  let sleep = 5
  let _ipfs
  while( limit > tryCount ){
    try{
      _ipfs = ipfsHttpClient({url: new URL(ipfs_http)})
      const _id = await _ipfs.id()
      log.info('Connected to IPFS %s', _id.id)
      return _ipfs
    }catch (e) {
      log.error('Try %d of %d failed to connect to IPFS: %O', tryCount, limit, e)
      child_process.execSync(`sleep ${sleep}`);
      sleep += 5
      tryCount += 1
    }
  }
  throw Error("Can Not Connect to IPFS")
}
