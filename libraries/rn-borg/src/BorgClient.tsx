import React, {createContext, useRef} from 'react';
import {StyleSheet} from 'react-native';
import WebView from "react-native-webview";
import {View} from 'react-native';
import {generateUUID, fileReader2} from "./utils";
import {messageHandler, transporter} from "./bridge";

export const BorgContext = createContext<Borg | null>(null);


interface Borg {
}

export default function Borg(props: any) {
    const webViewRef = useRef<WebView>(null)


    const postMessage = (message: any) => {
        if (webViewRef && webViewRef.current)
            webViewRef.current.postMessage(JSON.stringify(message))
        else
            throw Error("webview not Found")
    }
    const rpc = transporter(postMessage)

    const onMessage = (event: { nativeEvent: { data: string; }; }) => messageHandler(event)

    const borg: Borg = {
        async start() {
            const response = await rpc.RPC("start", [])
            return response.response
        },
        async connect(peerId: string) {
            const response = await rpc.RPC("connect", [peerId])
            return response.response
        },
        async sendFile(uri: string): Promise<string> {
            return new Promise<string>(async (resolve, reject) => {
                const reader = fileReader2(uri);
                const iterator = reader[Symbol.asyncIterator]();
                const obj = await iterator.next();
                const meta = obj.value
                // @ts-ignore
                const response = await rpc.RPCStreamArgs("sendFile", [], {iterator, meta})
                if (response.status === "done" && response.response)
                    resolve(response.response)
                else
                    reject(response.response)
            })
        },

        async receiveFile(fileId: string): Promise<string> {
            return new Promise<string>(async (resolve, reject) => {
                const {source, meta} = await rpc.RPCStreamResponse("receiveFile", [fileId])
                let result = ""
                // @ts-ignore
                source.subscribe({
                    next: (value) => {
                        result += value
                    },
                    error: (err) => reject(err),
                    complete: () => {
                        resolve(`data:${meta.type};base64,${result}`);
                    }
                })

            })
        },

        async receiveMeta(id: string) {
            const response = await rpc.RPC("receiveMeta", [id])
            return response.response
        }

    }

    return (
        <>
            <View style={styles.container}>
                <WebView
                    style={styles.container}
                    ref={webViewRef}
                    source={{uri: "https://192.168.1.7:3000"}}
                    onMessage={onMessage}
                    onError={(e) => console.log(e)}
                    originWhitelist={['*']}
                    javaScriptEnabled
                />
            </View>

            <BorgContext.Provider value={borg}>
                {props.children}
            </BorgContext.Provider>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        display: "none",
        position: "absolute",
        flex: 0,

        width: 0,
        height: 0,

        flexGrow: 0,
        flexShrink: 1
    }
});
