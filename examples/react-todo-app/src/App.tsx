import React, { useEffect, useState } from 'react';
import './App.css';
import { Borg, createClient } from '@functionland/borg'
import TodoList from './components/TodoList';
import { BorgProvider } from './providers/BorgProvider'

function App() {
  const [borgClient, setBorgClient] = useState<Borg>();
  const [output, setOutput] = useState("");
  const [serverId, setServerId] = useState("12D3KooWGDhpz99eeyyU3uWCXm5N91LYbVLV7p2x2kCeRXeh6aQ7")
  const [connectionStaus, setConnectionStaus] = useState(false)

  const startBorg = async () => {
    const borgClient = await createClient();
    const node = borgClient.getNode()

    node.connectionManager.on('peer:connect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      if(connection.remotePeer.toB58String()===serverId)
        setTimeout(() => {
          setConnectionStaus(true)
        }, 100);
      console.log(`Connected to ${connection.remotePeer.toB58String()}`);
    });
    node.connectionManager.on('peer:disconnect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      if(connection.remotePeer.toB58String()===serverId)
        setConnectionStaus(false);
      console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
    });
    node.on('peer:discovery', async (peerId: { toB58String: () => any; }) => {
      // console.log(`Found peer ${peerId.toB58String()}`);
      // setOutput(output + `${`Found peer ${peerId.toB58String()}`.trim()}\n`)
    });
    setBorgClient(borgClient);
  }
  const connect = async () => {
    console.log("connecting to borg...!")
    if (!borgClient) {
        console.log("borg is not mounted!")
        return
    }
    try {
        if(await borgClient.connect(serverId))
          console.log("borg is connected!")
        else
          console.log(`borg unable to connect!`)
    } catch (e) {
        console.log(`connect error`,e)
    }
} 
  useEffect(() => {
    startBorg();
  }, []);

  useEffect(()=>{
    connect();
  },[borgClient]);

  return (
    <div className='todo-app'>
      <BorgProvider borg={borgClient}>
        {connectionStaus?<TodoList />:null}
      </BorgProvider>
    </div>
  );
}

export default App;