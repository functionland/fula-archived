import './App.css';

import React, { useEffect, useState } from "react";
import { createClient, Status } from "@functionland/fula";

import { ConnInfo } from "./components/ConnInfo";
import { BoxConfig } from "./components/BoxConfig";
import { Uploader } from "./components/Uploader";
import { Gallery } from "./components/Gallery";


const pages = {
  GALLERY: 'home',
  CONFIG: 'config',
}

function App() {
  // simple routing mechanism page will keep our route state
  const [page, setPage] = useState(pages.CONFIG)
  // status of connection
  const [status, setStatus] = useState(null)
  // connection logs
  const [connInfo, setConnInfo] = useState("")
  // Fula client
  const [fula, setFula] = useState(undefined)
  // Id of the box
  const [boxId, setBoxId] = useState("")
  // List of photos to show
  const [photos, setPhotos] = useState([])


  // create client on component creation
  useEffect(() => {
    (async () => {
      setFula(await createClient())
    })()

  }, [])

  useEffect(() => {
    if (page === pages.GALLERY && status === Status.Online) {
      (async () => {
        const allData = await fula.graphql(readQuery)
        if (allData && allData.data && allData.data.read) {
          setPhotos([])
          for (const { cid } of allData.data.read) {
            const file = await fula.receiveFile(cid)
            setPhotos((prev) => [...prev, file])
          }
        }
      })()
    }
  }, [page, status])

  const onSet = (peer) => {
    if (peer) {
      setBoxId(peer);
      (async () => {
        if (peer && peer.length > 0) {
          try {
            setConnInfo("")
            await fula.disconnect()
            let con = fula.connect(peer)
            setStatus(Status.Connecting)
            con.on('status', (_status) => {
              setStatus(_status)
              _status===Status.Online && setConnInfo("")
            })
            con.on('error', (msg)=>{
              setConnInfo("Server not available")
            })
            setPage(pages.GALLERY)
          } catch (e) {
            setConnInfo(e.message)
          }
        }
      })();
    }

  }

  // call back function for uploading a photo
  // it will upload the file using fula file api
  // and then store its cid in fula data
  const onUpload = async (selectedFile) => {
    try {
      const cid = await fula.sendFile(selectedFile)
      await fula.graphql(createMutation, {values: [{cid, _id: cid}]})
      setPhotos((prev) => [selectedFile, ...prev])
    } catch (e) {
      console.log(e.message)
    }
  }

  // call back for routing to setting
  const onSetting = () =>{
    setPage(pages.CONFIG)
  }

  return <>
    <div className="app">
      {(() => {
        switch (page) {
          case pages.CONFIG:
            return <BoxConfig onSet={onSet} serverId={boxId}/>
          case pages.GALLERY:
            return <>
              <h1>Functionland Sample Gallery</h1>
              {status===Status.Online && <Uploader onUpload={onUpload}/>}
              {status!==Status.Connecting && <Gallery photos={photos}/> }
            </>

          default:
            return <h1>Route not found</h1>
        }
      })()}
    </div>
    <ConnInfo onSetting={onSetting} status={status} info={connInfo}/>
  </>

}

export default App;


export const readQuery = `
  query {
    read(input:{
      collection:"gallery",
      filter:{}
    }){
      cid
    }
  } 
`


export const createMutation = `
  mutation addImage($values:JSON){
    create(input:{
      collection:"gallery",
      values: $values
    }){
      cid
    }
  }
`;
