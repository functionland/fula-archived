import {client} from '@functionland/borg'
// import debug from 'debug'

// debug.disable("libp2p*")

interface Meta {
    id: string
    type: string
    func: string
    args: Array<string | FileMeta>
    message: string
    status: string
}

interface Log {
    type: string,
    message: string
}

interface FileMeta {
    'type': string
    'base64': string
}

function fromFileMeta(fileMeta: FileMeta) {
    // Decode Base64 string
    const decodedData = window.atob(fileMeta.base64);

    // Create UNIT8ARRAY of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length);

    // Insert all character code into uInt8Array
    for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
    }
    let blob = new Blob([uInt8Array], { type: fileMeta.type });
    return new File([blob], "test.jpg",{type:fileMeta.type});
}

async function main() {
    // @ts-ignore
    const postMessage = (data:Meta|Log) => window.ReactNativeWebView.postMessage(JSON.stringify(data))
    const postLog = (message:any) => postMessage({ type: "LOG", message})
    const postOnError = (e:Error, data:Meta)=>{
        postLog(`${data.func} failed`)
        data.status = "failed"
        data.message = (e as Error).message
        data.type = "RESPONSE"
        postMessage(data)
    }
    const postOnSuccess = (data:Meta) => {
        postLog(`${data.func} success`)
        data.status = "done"
        data.type = "RESPONSE"
        postMessage(data)
    }

    const adaptor = {
        connect: async (data: Meta) => {
            try {
                await borgClient.connect(<string>data.args[0])
            }catch (e) {
                postOnError((e as Error), data)
            }
            postOnSuccess(data)
        },
        sendFile: async (data: Meta) => {
            try{
                data.message = await borgClient.sendFile(fromFileMeta(<FileMeta>data.args[0]))
            }catch (e){
                postOnError((e as Error), data)
            }
            postOnSuccess(data)
        },
        receiveFile: async (data: Meta) => {
            try{
                data.message = await borgClient.receiveFile(<string>data.args[0])
            }catch (e) {
                postOnError((e as Error), data)
            }
            postOnSuccess(data)
        },
        receiveMeta: async (data: Meta) => {
            try{
                data.message = await borgClient.receiveMeta(<string>data.args[0])
            }catch (e) {
                postOnError((e as Error), data)
            }
            postOnSuccess(data)
        }
    }

    const log = (message:any)=>{
        // @ts-ignore
        postMessage({ type: "LOG", message})
    }
    document.addEventListener("message", function (event: any) {
        const data: Meta = JSON.parse(event.data)
        if (data.type === "EXEC") {

            // @ts-ignore
            adaptor[data.func](data)
        }
    }, false);

    let onPeerDiscovery = async (peerId: { toB58String: () => any; }) => {
        postLog(`Found peer ${peerId.toB58String()}`)
    };
    // Listen for new connections to peers
    let onPeerConnect = async (connection: { remotePeer: { toB58String: () => any; }; }) => {
        postLog(`Connected to ${connection.remotePeer.toB58String()}`);
    };
    // Listen for peers disconnecting
    let onPeerDisconnect = async (connection: { remotePeer: { toB58String: () => any; }; }) => {
        postLog(`Disconnected from ${connection.remotePeer.toB58String()}`);
    };


    const borgClient = await client();
    await borgClient.connectionHandler('peer:connect', onPeerConnect);
    await borgClient.connectionHandler('peer:disconnect', onPeerDisconnect);
    await borgClient.nodeHandler('peer:discovery', onPeerDiscovery);


}

main().catch(console.error);


