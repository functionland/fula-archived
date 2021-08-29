import { FileProtocol } from '@functionland/protocols'; // @ts-ignore
import { configure } from './config';

import Libp2p from 'libp2p'; // @ts-ignore
import type PeerId from 'peer-id';

export function graph(config?: any) {
  let node: Libp2p;
  let conf: any;
  let listener: PeerId;

  if (config) conf = configure(config);
  else conf = configure();

  return {
    async connect(listenerId?: PeerId) {
      if (listenerId) {
        listener = listenerId;
      }
      node = await Libp2p.create(conf);
      node.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);
      await node.start();
    },
    async sendFile(file: any): Promise<string> {
      if (!listener) {
        throw 'listener not found';
      }
      const id = await FileProtocol.sendFile({ to: listener, node, file });
      return id;
    },
    async receiveFile(id: string) {
      if (!listener) {
        throw 'listener not found';
      }
      let content = '';
      const decoder = new TextDecoder();
      for await (const chunk of FileProtocol.receiveContent({ from: listener, node, id })) {
        content += decoder.decode(chunk);
        console.log(content);
      }
      return content;
    },
    async receiveMeta(id: string) {
      if (!listener) {
        throw 'listener not found';
      }
      let content = '';
      const meta = await FileProtocol.receiveMeta({ from: listener, node, id });
      content = JSON.stringify(
        {
          ...meta,
          size: Number(meta.size),
          lastModified: Number(meta.lastModified),
        },
        null,
        2
      );
      return content;
    },
    async connectionHandler(handlerName: string | symbol, handler: (...args: any[]) => void) {
      node.connectionManager.on(handlerName, handler);
    },
    async nodeHandler(handlerName: string | symbol, handler: (...args: any[]) => void) {
      node.on(handlerName, handler);
    },
    setListener(listenerId: PeerId) {
      listener = listenerId;
    },
  };
}
