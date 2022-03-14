import './App.css';
import {useEffect, useState} from "react";
import {Header} from "./components/Header";
import {BoxConfig} from "./components/BoxConfig";
import {Uploader} from "./components/Uploader";
import {createClient, Status} from "@functionland/fula";


const pages = {
  HOME: 'home',
  CONFIG: 'config',
}

function App() {
  const [page, setPage] = useState(pages.CONFIG)
  const [status, setStatus] = useState('Need to Set BoxID')
  const [fula, setFula] = useState(undefined)
  const [boxId, setBoxId] = useState("")

  useEffect(() => {
    (async () => {
      setFula(await createClient())
    })()

  },[])

  useEffect(() => {
    (async () => {
      if (boxId && boxId.length > 0) {
        try {
          let con = await fula.connect(boxId)
          con.on('status', (_status) => {
            setStatus(_status)
          })
        } catch (e) {
          setStatus(e.message)
        }
      }
    })()
  }, [boxId,fula])

  useEffect(() => {
    if (status === Status.Online) {
      setPage(pages.HOME)
    }
  }, [status])

  const save = (peer) => {
    if (peer)
      setBoxId(peer)
  }

  return (<>
      <Header status={status}/>
      <div className="app-container">
        {(() => {
          switch (page) {
            case pages.CONFIG:
              return <BoxConfig save={save} serverId={boxId}/>
            case pages.HOME:
              return <Uploader fula={fula} />
            default:
              return <h1>Route not found</h1>
          }
        })()}
      </div>
    </>

  );
}

export default App;
