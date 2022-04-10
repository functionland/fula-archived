import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {createClient, Fula, Status} from '@functionland/fula'
import TodoList from './components/TodoList';
import {FulaProvider} from '@functionland/fula-client-react'

function App() {
  const inputRef = useRef<any>(null);
  const [fulaClient, setFulaClient] = useState<Fula>();
  const [connecting, setConnecting] = useState(false);
  const [serverIdInput, setServerIdInput] = useState("")
  const [serverId, setServerId] = useState<string>()
  const [connected, setConnected] = useState(false)


  useEffect(() => {
    const startFula = async () => {
      const fulaClient = await createClient();
      setFulaClient(fulaClient);
    }
    startFula();
    setServerId(localStorage.getItem("serverId")||"");
    inputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if(serverId && fulaClient){
      (async ()=>{
        setConnecting(true)
        const conn = fulaClient.connect(serverId)
        conn.on('status',(status)=>{
          switch (status){
            case Status.Connecting:
              setConnecting(true)
              setConnected(false)
              break
            case Status.Online:
              setConnected(true)
              setConnecting(false)
              break
            case Status.Offline:
              setConnected(false)
              setConnecting(false)
          }
        })
      })()
    }

  }, [fulaClient, serverId]);

  const handleChange = (e: any) => {
    setServerIdInput(e.target.value);
  };

  const handleConnect = (e: any) => {
    e.preventDefault();
    if(serverIdInput && serverIdInput.length>5){
      setServerId(serverIdInput)
      localStorage.setItem("serverId",serverIdInput)
    }
  };

  return (
    <div className='todo-app'>
      <FulaProvider fula={fulaClient}>
        {connected ? <TodoList /> : <div className='connect-container'>
          <div className='app-header'>
            {!connecting ? <h1>Connect to BOX!</h1> : null}
            {connecting ? <div className='lds-ellipsis'><div/><div/><div/><div/></div> : null}
          </div>
          <input
            placeholder='Enter your server Id'
            value={serverIdInput}
            onChange={handleChange}
            name='text'
            ref={inputRef}
            className='todo-input'
          />
          <button disabled={!fulaClient} onClick={handleConnect} className='todo-button'>
            Connect
          </button>

        </div>}
      </FulaProvider>
    </div>
  );
}

export default App;
