import React from 'react';
import { useEffect, useState } from 'react';
import './FileTransfer.css';
import { graph } from '@functionland/graph' // @ts-ignore
import PeerId from 'peer-id';

interface FileTransferProps {
    /**
     * Is this the principal call to action on the page?
     */

}

/**
 * Primary UI component for user interaction
 */
export const FileTransfer = ({
    ...props
}: FileTransferProps) => {
    const [myGraph, setMyGraph] = useState<any>(null);
    const [output, setOutput] = useState("");
    const [serverId, setServerId] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileId, setFileId] = useState("")
    const [content, setContent] = useState("")
    async function loadDataOnlyOnce() {
        let onPeerDiscovery = async (peerId: { toB58String: () => any; }) => {
            console.log(`Found peer ${peerId.toB58String()}`);
            setOutput(output + `${`Found peer ${peerId.toB58String()}`.trim()}\n`)
        };

        // Listen for new connections to peers
        let onPeerConnect = async (connection: { remotePeer: { toB58String: () => any; }; }) => {
            console.log(`Connected to ${connection.remotePeer.toB58String()}`);
            setServerId(connection.remotePeer.toB58String());
            myGraph.connect(PeerId.createFromB58String(connection.remotePeer.toB58String()));
        };

        // Listen for peers disconnecting
        let onPeerDisconnect = async (connection: { remotePeer: { toB58String: () => any; }; }) => {
            console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
        };

        const myGraph = await graph();
        myGraph.connectionHandler('peer:connect', onPeerConnect);
        myGraph.connectionHandler('peer:disconnect', onPeerDisconnect);
        myGraph.nodeHandler('peer:discovery', onPeerDiscovery);
        return myGraph
    }
    const sendFile = async ()=>{
        const id = await myGraph.sendFile(selectedFile); // @ts-ignore
        setFileId(id);
    }

    const receiveFile = async ()=>{
        const data = await myGraph.receiveFile(fileId);
        setContent(data);
    }

    const receiveMeta = async ()=>{
        const data = await myGraph.receiveMeta(fileId);
        setContent(data);
    }

    const handleSelectFile = (event:any)=>{
        setSelectedFile(event.target.files[0])
    }
    
    useEffect(() => {
        (async () => {
            const temp = await loadDataOnlyOnce()
            setMyGraph(temp)
        })()

    }, []);

    return (
        <div
            {...props}
        >
            <header>
                <h1 id="status">Starting libp2p...</h1>
                <input id="serverId" value={serverId} style={{ width: "500px" }} placeholder={"Type server's PeerId here"} />
                <input id="file" type="file" onChange={handleSelectFile}/>
                <button id="send" onClick={sendFile}>Send</button>
                <br />
                <br />
                <input id="fileId" value={fileId} onChange= {(e)=> setFileId(e.target.value)} style={{ width: "500px" }} placeholder="Enter _id of a file here" />
                <button id="receive" onClick={receiveFile}>Receive</button>
                <button id="meta" onClick={receiveMeta}>Meta</button>
                <br />
                <br />
                <textarea id="content" value={content} style={{ width: "500px", height: "100px" }}></textarea>
            </header>
            <main>
                <pre id="output">{output}</pre>
            </main>
        </div>
    );
};
