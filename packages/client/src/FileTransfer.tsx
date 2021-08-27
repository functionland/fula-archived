import React from 'react';
import { useEffect } from 'react';
import './FileTransfer.css';
import graph from '@functionland/graph'

interface FileTransferProps {
    /**
     * Is this the principal call to action on the page?
     */
}

/**
 * Primary UI component for user interaction
 */
export const FileTransfer =  ({
    ...props
}: FileTransferProps) => {
    useEffect( () => {
        let myGraph = graph();
        // (async ()=>{
        //     let myGraph = graph();
        //     await myGraph.connect();
        // })()

    })
    return (
        <div
            {...props}
        >
            <header>
                <h1 id="status">Starting libp2p...</h1>
                <input id="serverId" style={{ width: "500px" }} placeholder={"Type server's PeerId here"} />
                <input id="file" type="file" />
                <button id="send">Send</button>
                <br />
                <br />
                <input id="fileId" style={{ width: "500px" }} placeholder="Enter _id of a file here" />
                <button id="receive">Receive</button>
                <button id="meta">Meta</button>
                <br />
                <br />
                <textarea id="content" style={{ width: "500px", height: "100px" }}></textarea>
            </header>
            <main>
                <pre id="output"></pre>
            </main>
        </div>
    );
};
