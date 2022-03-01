import React from 'react';
import {useEffect, useState} from 'react';
import './FileTransfer.css';
import {Borg, createClient} from '@functionland/fula'
import {SchemaProtocol} from "../../../protocols/file";
import {rejects} from "assert";
import {base64} from "rfc4648";

interface FileTransferProps {
    /**
     * Is this the principal call to action on the page?
     */

}

/**
 * Primary UI component for user interaction
 */
export const FileTransfer = ({...props}: FileTransferProps) => {
    const [fulaClient, setBorgClient] = useState<Borg>();
    const [output, setOutput] = useState("");
    const [serverId, setServerId] = useState("QmNi7CkBYtzt8vaDhFFXZ29dzaK5FdMWdiG1cxnJYDQLKB")
    const [selectedFile, setSelectedFile] = useState<File|null>(null)
    const [fileId, setFileId] = useState("QmQdHtY586drMqfKCUEWZpufMLGuXc9bZ3fiGWde9pY31N")
    const [content, setContent] = useState("")

    async function startBorg() {
        const fulaClient = await createClient();
        const node = fulaClient.getNode()

        node.connectionManager.on('peer:connect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
            console.log(`Connected to ${connection.remotePeer.toB58String()}`);
        });
        node.connectionManager.on('peer:disconnect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
            console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
        });
        node.on('peer:discovery', async (peerId: { toB58String: () => any; }) => {
            console.log(`Found peer ${peerId.toB58String()}`);
            setOutput(output + `${`Found peer ${peerId.toB58String()}`.trim()}\n`)
        });
        return fulaClient
    }

    const connect = async () => {
        if (!fulaClient) {
            console.log("fula not connected")
            return
        }
        try {
            await fulaClient.connect(serverId)
        } catch (e) {
            console.log(`error is ${e}`)
        }

    }
    const sendFile = async () => {
        if (!fulaClient || !selectedFile) {
            console.log("fula not connected or file not exist")
            return
        }
        const meta =  {name:selectedFile.name,type:selectedFile.type,lastModified:selectedFile.lastModified,size:selectedFile.size}
        const id = await fulaClient.sendStreamFile(fileReader2(selectedFile),meta);
        setFileId(id);
    }

    const receiveFile = async () => {
        if (!fulaClient) {
            console.log("fula not connected")
            return
        }
        try {
            console.log("r u there")
            const data = await fulaClient.receiveFile(fileId);
            console.log(data)
            let reader = new FileReader();
            reader.readAsDataURL(data);
            // @ts-ignore
            reader.onloadend = (e) => setContent(reader.result)
        }catch (e) {
            console.log(e)
        }


    }

    const receiveMeta = async () => {
        if (!fulaClient) {
            console.log("fula not connected")
            return
        }
        try{
            console.log("meta there")
            const data = await fulaClient.receiveMeta(fileId);
            console.log(data)
            setContent(JSON.stringify(data));
        }catch (e) {
            console.log(e)
        }

    }

    const handleSelectFile = (event: any) => {
        setSelectedFile(event.target.files[0])
    }

    const handleServerId = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setServerId(event.target.value)
    }

    useEffect(() => {
        (async () => {
            const temp = await startBorg()
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
                       placeholder={"Type server's PeerId here"} value={serverId}/>
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

const getBase64  = (file:File):Promise<string> =>{
    return new Promise<string>((resolve,rejects)=>{
        const reader = new FileReader()
        reader.onloadend = (e)=>{
            if(reader.result)resolve((reader.result as string).split(',')[1])

        }
        reader.readAsDataURL(file)
    })
}

async function* fileReader2(file:File, chunksAmount:number=4*2048*100):AsyncIterable<Uint8Array> {
    const content = await getBase64(file)
    let byteStart = 0;
    let byteEnd = chunksAmount;
    while (byteStart < content.length){
        yield base64.parse(JSON.parse(JSON.stringify({content:content.slice(byteStart,byteEnd)})).content)
        byteStart = byteEnd
        byteEnd += chunksAmount
        if(byteEnd>=content.length) {
            byteEnd = content.length
        }
    }
}
