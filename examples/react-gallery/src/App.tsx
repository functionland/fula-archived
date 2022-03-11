import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Fula, createClient } from '@functionland/fula'
import Gallery from './components/Gallery';
import { FulaProvider } from '@functionland/fula-client-react'


function App() {
  const inputRef = useRef<any>(null);
  const [fulaClient, setFulaClient] = useState<Fula>();
  const [serverId, setServerId] = useState("")
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(false)



  const startFula = async () => {
    const fulaClient = await createClient();

    const node = fulaClient.getNode()

    node.connectionManager.on('peer:connect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      setServerId(srvId=>{
        if (connection.remotePeer.toB58String() === srvId)
        setTimeout(() => {
          setConnectionStatus(true)
        }, 100);
        localStorage.setItem("serverId",srvId||"")
        return srvId;
      })
      console.log(`Connected to ${connection.remotePeer.toB58String()}`);
    });
    node.connectionManager.on('peer:disconnect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      if (connection.remotePeer.toB58String() === serverId)
        setConnectionStatus(false);
      console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
    });
    node.on('peer:discovery', async (peerId: { toB58String: () => any; }) => {
      // console.log(`Found peer ${peerId.toB58String()}`);
      // setOutput(output + `${`Found peer ${peerId.toB58String()}`.trim()}\n`)
    });
    setFulaClient(fulaClient);
  }

  const connect = async () => {
    console.log("connecting to fula...!")
    try {
      setConnecting(true);
      if (!fulaClient) {
        console.log("fula is not mounted!")
        return
      }
      if (await fulaClient.connect(serverId))
        console.log("fula is connected!")
      else
        console.log(`fula unable to connect!`)
    } catch (e) {
      console.log(`connect error`, e)
    } finally {
      setConnecting(false);
    }
  }

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

  useEffect(() => {
    startFula();
    setServerId(localStorage.getItem("serverId")||"");
    inputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if(serverId)
      connect()
  }, [fulaClient]);


  return (
    <div className='app'>
      <FulaProvider fula={fulaClient}>
        {connectionStatus ? <Gallery /> : <div className='connect-container'>
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
            className='input'
          />
          <button disabled={!fulaClient} onClick={handleConnect} className='button'>
            Connect
          </button>

        </div>}
      </FulaProvider>
    </div>
  );

}

export default App;
