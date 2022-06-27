import http from 'http';

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
    console.log(`  ${ma.toString()}`)
  }
}
