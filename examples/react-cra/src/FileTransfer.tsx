import React from 'react';
import {useEffect, useState} from 'react';
import './FileTransfer.css';
import {Borg, createClient} from '@functionland/borg' // @ts-ignore
// import PeerId from 'peer-id';

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
    const [borgClient, setBorgClient] = useState<Borg>();
    const [output, setOutput] = useState("");
    const [serverId, setServerId] = useState("QmVYZsjTgm3hBWkkSBugNJYYLPmGTACfoc4HGfqqE6TMcT")
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
            // setServerId(connection.remotePeer.toB58String());
            // borgClient.connect(PeerId.createFromB58String(connection.remotePeer.toB58String()));
        };

        // Listen for peers disconnecting
        let onPeerDisconnect = async (connection: { remotePeer: { toB58String: () => any; }; }) => {
            console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
        };

        const borgClient = await createClient();
        const node = borgClient.getNode()
        node.connectionManager.on('peer:connect', onPeerConnect);
        node.connectionManager.on('peer:disconnect', onPeerDisconnect);
        node.on('peer:discovery', onPeerDiscovery);
        return borgClient
    }

    const connect = async () => {
        if(!borgClient){
            console.log("borg not connected")
            return
        }
        try{
            await borgClient.connect(serverId)
            console.log("connect misheh")
        }catch (e) {
            console.log(`error is ${e}`)
        }

    }
    const sendFile = async () => {
        if(!borgClient || !selectedFile){
            console.log("borg not connected or file not exist")
            return
        }
        const id = await borgClient.sendFile(selectedFile); // @ts-ignore
        setFileId(id);
    }

    const receiveFile = async () => {
        if(!borgClient){
            console.log("borg not connected")
            return
        }
        const data = await borgClient.receiveFile(fileId);
        console.log(data)
        let reader = new FileReader();
        reader.readAsDataURL(data);
        // @ts-ignore
        reader.onloadend = (e)=> setContent(reader.result)
    }

    const receiveMeta = async () => {
        if(!borgClient){
            console.log("borg not connected")
            return
        }
        const data = await borgClient.receiveMeta(fileId);
        setContent(JSON.stringify(data));
    }

    const handleSelectFile = (event: any) => {
        setSelectedFile(event.target.files[0])
    }

    const handleServerId = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setServerId(event.target.value)
    }

    useEffect(() => {
        (async () => {
            const temp = await loadDataOnlyOnce()
            setBorgClient(temp)
        })()

    }, []);

    return (
        <div
            {...props}
        >
            <header>
                <h1 id="status">Starting libp2p...</h1>
                <input id="serverId" style={{width: "500px"}} onChange={handleServerId}
                       placeholder={"Type server's PeerId here"} value={serverId} />
                <input id="file" type="file" onChange={handleSelectFile}/>
                <button id="send" onClick={sendFile}>Send</button>
                <button id="connect" onClick={connect}>Connect</button>
                <br/>
                <br/>
                <input id="fileId" value={fileId} onChange={(e) => setFileId(e.target.value)} style={{width: "500px"}}
                       placeholder="Enter _id of a file here"/>
                <button id="receive" onClick={receiveFile}>Receive</button>
                <button id="meta" onClick={receiveMeta}>Meta</button>
                <br/>
                <br/>
                <img src={content}></img>
            </header>
            <main>
                <pre id="output">{output}</pre>
            </main>
        </div>
    );
};
