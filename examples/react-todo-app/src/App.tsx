import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Borg, createClient } from '@functionland/borg'
import TodoList from './components/TodoList';
import { BorgProvider } from '@functionland/borg-client-react'

function App() {
  const inputRef = useRef<any>(null);
  const [borgClient, setBorgClient] = useState<Borg>();
  const [connecting, setConnecting] = useState(false);
  const [serverId, setServerId] = useState("")
  const [connectionStaus, setConnectionStaus] = useState(false)

  const startBorg = async () => {
    const borgClient = await createClient();
    const node = borgClient.getNode()

    node.connectionManager.on('peer:connect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      setServerId(srvId=>{
        if (connection.remotePeer.toB58String() === srvId)
        setTimeout(() => {
          setConnectionStaus(true)
        }, 100);
        localStorage.setItem("serverId",srvId||"")
        return srvId;
      })
     
      console.log(`Connected to ${connection.remotePeer.toB58String()}`);
    });
    node.connectionManager.on('peer:disconnect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      if (connection.remotePeer.toB58String() === serverId)
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
    try {
      setConnecting(true);
      if (!borgClient) {
        console.log("borg is not mounted!")
        return
      }
      if (await borgClient.connect(serverId))
        console.log("borg is connected!")
      else
        console.log(`borg unable to connect!`)
    } catch (e) {
      console.log(`connect error`, e)
    } finally {
      setConnecting(false);
    }
  }
  useEffect(() => {
    startBorg();
    setServerId(localStorage.getItem("serverId")||"");
    inputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if(serverId)
      connect()
  }, [borgClient]);
  const handleChange = (e: any) => {
    setServerId(e.target.value);
  };
  const handleConnect = (e: any) => {
    e.preventDefault();
    setConnecting(prev => {
      if (!prev) {
        connect();
        return !prev
      }
      return prev;
    })

  };
  return (
    <div className='todo-app'>
      <BorgProvider borg={borgClient}>
        {connectionStaus ? <TodoList /> : <div className='connect-container'>
          <div className='app-header'>
            {!connecting ? <h1>Connect to BOX!</h1> : null}
            {connecting ? <div className='lds-ellipsis'><div></div><div></div><div></div><div></div></div> : null}
          </div>
          <input
            placeholder='Enter your server Id'
            value={serverId}
            onChange={handleChange}
            name='text'
            ref={inputRef}
            className='todo-input'
          />
          <button disabled={!borgClient} onClick={handleConnect} className='todo-button'>
            Connect
          </button>

        </div>}
      </BorgProvider>
    </div>
  );
}

export default App;