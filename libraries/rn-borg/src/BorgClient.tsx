import React, { createContext, useRef } from 'react';
import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { View } from 'react-native';
import { fileReader2 } from './utils';
import { messageHandler, bridge } from './bridge';
import { template } from './template';
import {Message, RPCStatusType} from '@functionland/rn-borg-bridge/types';

export const BorgContext = createContext({});

interface Borg {
  start: () => Promise<string>
  connect: (peerId:string) => Promise<string>
  sendFile: (uri:string) => Promise<string>
  receiveFile: (fileId: string) => Promise<string>
  receiveMeta: (fileId: string) => Promise<string>
}

export default function Borg(props: any) {
  const webViewRef = useRef(null);

  const postMessage = (message: Message) => {
    if (webViewRef && webViewRef.current)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      { // @ts-ignore
        webViewRef.current.postMessage(JSON.stringify(message));
      }
    else throw Error('webview not Found');
  };
  const rpc = bridge(postMessage);

  const onMessage = (event: { nativeEvent: { data: string } }) =>
    messageHandler(event);

  const borg: Borg = {
    async start() {
      const response = await rpc.RPC('start', []);
      return response.payload;
    },
    async connect(peerId: string) {
      const response = await rpc.RPC('connect', [peerId]);
      return response.payload;
    },
    async sendFile(uri: string): Promise<string> {
      const reader = fileReader2(uri);
      const iterator = reader[Symbol.asyncIterator]();
      const obj = await iterator.next();
      const meta = obj.value;
      const response = await rpc.RPCStreamArgs('sendFile', [], {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        iterator,
        meta
      });
      return new Promise((resolve, reject) => {
        if (response.status === RPCStatusType.done && response.payload)
          resolve(response.payload);
        else reject(response.payload);
      });
    },

    async receiveFile(fileId: string): Promise<string> {
      const { source, meta } = await rpc.RPCStreamResponse('receiveFile', [
        fileId
      ]);
      let result = '';
      return new Promise((resolve, reject) => {
        source.subscribe({
          next: (value: string) => {
            result += value;
          },
          error: (err: Error) => reject(err),
          complete: () => {
            resolve(`data:${meta.type};base64,${result}`);
          }
        });
      });
    },

    async receiveMeta(id: string) {
      const response = await rpc.RPC('receiveMeta', [id]);
      return response.payload;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <WebView
          style={styles.container}
          ref={webViewRef}
          source={{ html: template(), baseUrl: 'https://localhost' }}
          onMessage={onMessage}
          onError={(e) => console.log(e)}
          originWhitelist={['*']}
          javaScriptEnabled
        />
      </View>
      <BorgContext.Provider value={borg}>{props.children}</BorgContext.Provider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'none',
    position: 'absolute',
    flex: 0,

    width: 0,
    height: 0,

    flexGrow: 0,
    flexShrink: 1
  }
});
