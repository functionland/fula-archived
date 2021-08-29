import React, { useEffect } from 'react'
import './style.css'
import { FileTransfer } from './FileTransfer'
import { graph } from '@functionland/graph'



async function loadDataOnlyOnce() {
  let onPeerDiscovery = async (peerId: { toB58String: () => any; }) => {
    console.log(`Found peer ${peerId.toB58String()}`);
  };

  // Listen for new connections to peers
  // let onPeerConnect = async (connection: { remotePeer: { toB58String: () => any; }; }) => {
  //   console.log(`Connected to ${connection.remotePeer.toB58String()}`);
  //   myGraph.setListener(PeerId.createFromB58String(connection.remotePeer.toB58String()));
  // };

  // Listen for peers disconnecting
  let onPeerDisconnect = async (connection: { remotePeer: { toB58String: () => any; }; }) => {
    console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
  };

  const myGraph = graph()
  await myGraph.connect();
  // myGraph.connectionHandler('peer:connect', onPeerConnect);
  myGraph.connectionHandler('peer:disconnect', onPeerDisconnect);
  myGraph.nodeHandler('peer:discovery', onPeerDiscovery);
  return myGraph
}

export default function App() {
  useEffect(() => {
    const myGraph = loadDataOnlyOnce();
  }, []);
  return <div>
    Hello World!
    <FileTransfer></FileTransfer>
  </div>
}
