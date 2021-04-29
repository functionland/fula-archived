import Libp2p from 'libp2p';
import multiaddr from 'multiaddr';
import Bootstrap from 'libp2p-bootstrap';
import Websockets from 'libp2p-websockets';
import WebRTCStar from 'libp2p-webrtc-star';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
// import pipe from 'it-pipe';

document.addEventListener('DOMContentLoaded', async () => {
    // use the same peer id as in `listener.js` to avoid copy-pasting of listener's peer id into `peerDiscovery`
    const hardcodedPeerId = '12D3KooWP9j4Cp8hEbMMxLuKYZ8RvXuBi81QneULrawgRo8HTD3x'
    const serverPeerAddress = `/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/${hardcodedPeerId}`
    const libp2p = await Libp2p.create({
      addresses: {
        // Add the signaling server address, along with our PeerId to our multiaddrs list
        // libp2p will automatically attempt to dial to the signaling server so that it can
        // receive inbound connections from other peers
        listen: [
          // '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          // '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'          
          '/ip4/0.0.0.0/tcp/0',
          '/ip4/0.0.0.0/tcp/0/ws',
          `/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/`
        ]
      },
      modules: {
        transport: [Websockets, WebRTCStar],
        streamMuxer: [Mplex],
        connEncryption: [NOISE],
        peerDiscovery: [Bootstrap]
      },
      config: {
        peerDiscovery: {
          [Bootstrap.tag]: {
            enabled: true,
            list: [
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
            ]
          }
        }
      }
    })
  
    const status = document.getElementById('status')
    const output = document.getElementById('output')
  
    output.textContent = ''
  
    function log (txt) {
      console.info(txt)
      output.textContent += `${txt.trim()}\n`
    }
  
    // Listen for new peers
    libp2p.on('peer:discovery', async (peerId) => {
      log(`Found peer ${peerId.toB58String()}`)
      if (peerId.toB58String() === hardcodedPeerId) {        
        const connection = await libp2p.dial(multiaddr(serverPeerAddress))
        console.log(connection)
      }
    })
  
    // Listen for new connections to peers
    libp2p.connectionManager.on('peer:connect', (connection) => {
      log(`Connected to ${connection.remotePeer.toB58String()}`)
    })
  
    // Listen for peers disconnecting
    libp2p.connectionManager.on('peer:disconnect', (connection) => {
      log(`Disconnected from ${connection.remotePeer.toB58String()}`)
    })
  
    await libp2p.start()
    status.innerText = 'libp2p started!'
    log(`libp2p id is ${libp2p.peerId.toB58String()}`)
    // const { stream } = await libp2p.dialProtocol(multiaddr(serverPeerAddress), '/chat')
    console.log('stream')
    // await pipe(
    //   ['yoyo'],
    //   stream
    // )
    
  
  })
