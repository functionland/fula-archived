// import PeerId from 'peer-id';

// import { graph } from './index';

// document.addEventListener('DOMContentLoaded', async () => {
//   // Listen for new peers
//   let onPeerDiscovery = async peerId => {
//     log(`Found peer ${peerId.toB58String()}`);
//   };

//   // Listen for new connections to peers
//   let onPeerConnect = async connection => {
//     log(`Connected to ${connection.remotePeer.toB58String()}`);
//     document.getElementById('serverId').value = connection.remotePeer.toB58String();
//     myGraph.setListener(PeerId.createFromB58String(connection.remotePeer.toB58String()));
//   };

//   // Listen for peers disconnecting
//   let onPeerDisconnect = async connection => {
//     log(`Disconnected from ${connection.remotePeer.toB58String()}`);
//   };

//   let myGraph = graph();
//   await myGraph.connect();
//   myGraph.connectionHandler('peer:connect', onPeerConnect);
//   myGraph.connectionHandler('peer:disconnect', onPeerDisconnect);
//   myGraph.nodeHandler('peer:discovery', onPeerDiscovery);

//   const status = document.getElementById('status');
//   const output = document.getElementById('output');

//   output.textContent = '';

//   function log(txt) {
//     console.info(txt);
//     output.textContent += `${txt.trim()}\n`;
//   }

//   status.innerText = 'libp2p started!';
//   // log(`libp2p id is ${graph.node.peerId.toB58String()}`);
//   // const { stream } = await libp2p.dialProtocol(multiaddr(serverPeerAddress), '/chat')
//   // console.log('stream');
//   // await pipe(
//   //   ['yoyo'],
//   //   stream
//   // )

//   const sendButton = document.getElementById('send');
//   const fileIdInput = document.getElementById('fileId');
//   sendButton.addEventListener('click', async () => {
//     const file = document.getElementById('file').files[0];
//     const id = await myGraph.sendFile(file);
//     fileIdInput.value = id;
//   });

//   const receiveButton = document.getElementById('receive');
//   const content = document.getElementById('content');
//   receiveButton.addEventListener('click', async () => {
//     const id = fileIdInput.value;
//     content.value = '';
//     content.value = await myGraph.receiveFile(id);
//   });

//   const metaButton = document.getElementById('meta');
//   metaButton.addEventListener('click', async () => {
//     const id = fileIdInput.value;
//     content.value = '';
//     content.value = await myGraph.receiveMeta(id);
//   });
// });
