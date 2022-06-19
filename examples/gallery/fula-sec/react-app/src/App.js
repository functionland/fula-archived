import './App.css';
import React, {useEffect, useState} from "react";
import {createClient, Status} from "@functionland/fula";
import {TaggedEncryption} from '@functionland/fula-sec';

import {ConnInfo} from "./components/ConnInfo";
import {BoxConfig} from "./components/BoxConfig";
import {Uploader} from "./components/Uploader";
import {Gallery} from "./components/Gallery";
import {Identity} from './components/Identity';
import Wallet from './components/Wallet';


const pages = {
  GALLERY: 'home',
  CONFIG: 'config'
};

function App() {
  // simple routing mechanism page will keep our route state
  const [page, setPage] = useState(pages.CONFIG);
  // status of connection
  const [status, setStatus] = useState(null);
  // connection logs
  const [connInfo, setConnInfo] = useState('');
  // Fula client
  const [fula, setFula] = useState(undefined);
  // Id of the box
  const [boxIds, setBoxIds] = useState([])
  // List of photos to show
  const [photos, setPhotos] = useState([]);
  // User DID
  const [userDID, setDidObj] = useState(null);


  useEffect(() => {
    if (page === pages.GALLERY && status === Status.Online && fula) {
      (async () => {
        const allData = await fula.graphql(readQuery);
        if (allData && allData.data && allData.data.read) {
          setPhotos([]);
          for (const {cid, jwe} of allData.data.read) {
            let file = null
            console.log({cid, jwe})
            if (jwe) {
              console.log("encrypted photo")
              const tagged = new TaggedEncryption(userDID.did)

              let plainObject
              try {
                plainObject = await tagged.decrypt(jwe)
              } catch (e) {
                console.log(e)
                continue
              }
              const _iv = []
              for (let i=0; i<16; i+=1)
                _iv.push(plainObject.symetricKey.iv[i])

              const _symKey = []
              for (let i=0; i<32; i+=1)
                _symKey.push(plainObject.symetricKey.symKey[i])

              file = await fula.receiveDecryptedFile(cid, Uint8Array.from(_symKey), Uint8Array.from(_iv))
            } else {
              console.log("not encrypted photo")
              file = await fula.receiveFile(cid);
            }
            if(file)
              setPhotos((prev) => [...prev, file]);
          }
        } else {
          setPhotos([])
        }
      })();
    }
  }, [page, status, fula, userDID?.did]);

  const onSet = (peers, key_file) => {
    if (peers.length > 0) {
      setBoxIds(peers);
      (async () => {
        try {
          setConnInfo("")
          if (fula)
            fula.close()
          let _fula
          if (key_file) {
            const key = await key_file.arrayBuffer()
            _fula = await createClient({netSecret:key})
            setFula(_fula)
          } else {
            _fula = await createClient()
            setFula(_fula)
          }
          let con = _fula.connect(peers)
          setStatus(Status.Connecting)
          con.on('status', (_status) => {
            setStatus(_status)
            _status === Status.Online && setConnInfo("")
          })
          con.on('error', () => {
            setConnInfo("Server not available")
          })
          setPage(pages.GALLERY)
        } catch (e) {
          setConnInfo(e.message)
        }

      })();
    }
  };

  // call back function for uploading a photo
  // it will upload the file using fula file api
  // and then store its cid in fula data
  const onUpload = async (selectedFile) => {
    try {
      // const cid = await fula.sendFile(selectedFile);
      // await fula.graphql(createMutation, { values: [{ cid, _id: cid }] });
      const {cid, key} = await fula.sendEncryptedFile(selectedFile)
      const tagged = new TaggedEncryption(userDID.did)

      let plaintext = {
        symmetricKey: key,
        CID: cid
      }

      let jwe = await tagged.encrypt(plaintext.symmetricKey, plaintext.CID, [userDID.did.id])
      await fula.graphql(createMutation, {values: [{cid, _id: cid, jwe}]})
      setPhotos((prev) => [selectedFile, ...prev]);
    } catch (e) {
      console.log(e.message);
    }
  };

  // call back for routing to setting
  const onSetting = () => {
    setPage(pages.CONFIG)
  }

  const onDIDSet = (did) => {
    setDidObj(did)
  }

  return (
    <>
      <div className="app">
        <Identity onDIDSet={onDIDSet}/>
        <Wallet />
        {(() => {
          switch (page) {
            case pages.CONFIG:
              return <BoxConfig onSet={onSet} serverId={boxIds.join(',')}/>
            case pages.GALLERY:
              return <>
                <h1>Functionland Sample Gallery</h1>
                {status === Status.Online && <Uploader onUpload={onUpload}/>}
                {status !== Status.Connecting && <Gallery photos={photos}/>}
              </>

            default:
              return <h1>Route not found</h1>
          }
        })()}
      </div>
      <ConnInfo onSetting={onSetting} status={status} info={connInfo}/>
    </>
  )
}

export default App;

export const readQuery = `
  query {
    read(input:{
      collection:"gallery",
      filter:{}
    }){
      cid,
      symKey,
      iv,
      jwe
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
