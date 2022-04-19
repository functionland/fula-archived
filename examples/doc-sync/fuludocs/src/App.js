import './App.css';

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { createClient, Status } from "@functionland/fula";
import { ConnInfo } from "./components/ConnInfo";
import { BoxConfig } from "./components/BoxConfig";
const md = require('markdown-it')('commonmark');

const pages = {
  HOME: 'home',
  CONFIG: 'config',
}

function useQuery() {
  const { search } = useLocation()
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const AppContent = (props) => {
  let query = useQuery();

  // Current doc to show
  const [currentDoc, setCurrentDoc] = useState(undefined)
  const [isLoadingDoc, setIsLoadingDoc] = useState(true)


  useEffect(() => {
    if (query.get('meeting')!==null && props.page === pages.HOME && props.status === Status.Online) {
      (async () => {
        const readQuery = createReadQuery(query.get('meeting'))
        const resultIterator = props.fula.graphqlSubscribe(readQuery)
        setIsLoadingDoc((prev) => false)

        for await (const res of resultIterator) {
          const allData = res.data

          if (allData && allData.read) {
            for (const obj of allData.read) {
              const file = await props.fula.receiveFile(obj.cid)
              const content = await file.text()
              setCurrentDoc((prev) => content)
            }
          }

        }
      })()
    }
  }, [props.page, props.status, props.fula])

  let result;
  if(currentDoc!==undefined) {
    result = md.render(currentDoc);
  } else {
    result = md.render(`Doc not found.`);
  }


  switch (props.page) {
    case pages.CONFIG:
      return <BoxConfig onSet={props.onSet} serverId={props.boxId}/>
    case pages.HOME:
      if(query.get('meeting')===null) {
        return <div className="error" >Meeting ID not specified in URL.</div>
      } else if(isLoadingDoc) {
        return <div className="loading" >Loading your doc...</div>
      } else {
        return <div className="markdown" dangerouslySetInnerHTML={{__html:result}} />
      }
    default:
      return <h1>Route not found</h1>
  }
}


function App() {
  // status of connection
  const [status, setStatus] = useState(null)
  // connection logs
  const [connInfo, setConnInfo] = useState("")
  // Fula client
  const [fula, setFula] = useState(undefined)
  // Id of the box
  const [boxId, setBoxId] = useState("")
  // simple routing mechanism page will keep our route state
  const [page, setPage] = useState(pages.CONFIG)



  // create client on component creation
  useEffect(() => {
    (async () => {
      setFula(await createClient())
    })()

  }, [])


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
            con.on('error', ()=>{
              setConnInfo("Server not available")
            })
            setPage(pages.HOME)
          } catch (e) {
            setConnInfo(e.message)
          }
        }
      })();
    }
  }

  // call back for routing to setting
  const onSetting = () =>{
    setPage(pages.CONFIG)
  }


  return <Router>
    <div className="header">
      <h1 className="heading">
        FuluDoc
      </h1>
    </div>
    <div className="app">
      <AppContent page={page} onSet={onSet} status={status} boxId={boxId} fula={fula} />
    </div>
    <div className="footer">
      <ConnInfo onSetting={onSetting} status={status} info={connInfo}/>
    </div>
  </Router>

}

export default App;


export const createReadQuery = (meetingId) => {
  return `
    query {
      read(input:{
        collection:"meeting",
        filter:{id:{eq:"${meetingId}"}}
      }){
        cid,
        meetingCode
      }
    }
  `
}

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
