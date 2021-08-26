import { FileProtocol } from '@functionland/protocols';
import { configure } from './config';

import Libp2p from 'libp2p'; // @ts-ignore

import type PeerId from 'peer-id';
import type { Config } from 'ipfs-core-types/src/config';

export function graph(config?: Config) {
  let node: Libp2p;
  let conf: Config;
  let listener: PeerId;

  if (config) conf = configure(config);
  else conf = configure();

  return {
    async connect(listenerId?: PeerId) {
      if (listenerId) {
        listener = listenerId;
      }
      node = await Libp2p.create(conf);
      await node.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);
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

// export class Graph {
//   node: Libp2p | null = null;
//   conf: Config;
//   connectHandler: (...args: any[]) => void;
//   disconnectHandler: (...args: any[]) => void;
//   discovryHandler: (...args: any[]) => void;

//   constructor(
//     config: Config,
//     connectHandler: (...args: any[]) => void,
//     disconnectHandler: (...args: any[]) => void,
//     discovryHandler: (...args: any[]) => void
//   ) {
//     this.connectHandler = connectHandler;
//     this.disconnectHandler = disconnectHandler;
//     this.discovryHandler = discovryHandler;
//     this.conf = configFactory(config);
//   }

//   getNode() {
//     if (this.node) return this.node;
//     else throw 'fucking not instasitioned';
//   }

//   setConnectHandler(handler: (...args: any[]) => void) {
//     this.connectHandler = handler;
//   }

//   setDisconnectHandler(handler: (...args: any[]) => void) {
//     this.disconnectHandler = handler;
//   }

//   setDiscoveryHandler(handler: (...args: any[]) => void) {
//     this.connectHandler = handler;
//   }
// }

// export class GraphLogic {
//   static async connect(graph: Graph) {
//     if (graph.node) {
//       await graph.node.stop();
//     }
//     graph.node = await Libp2p.create(graph.conf);
//     await graph.node.handle(FileProtocol.PROTOCOL, FileProtocol.handleFile);
//     await graph.node.start();
//     graph = GraphLogic.onPeerConnect(graph, graph.connectHandler);
//     graph = GraphLogic.onPeerDisconnect(graph, graph.disconnectHandler);
//     graph = GraphLogic.onPeerDiscovery(graph, graph.discovryHandler);

//     return graph;
//   }

//   static onPeerDiscovery(graph: Graph, handler: (...args: any[]) => void): Graph {
//     graph.setDiscoveryHandler(handler);
//     if (graph.node) {
//       graph.node.on('peer:discovery', graph.discovryHandler);
//     }
//     return graph;
//   }

//   static onPeerConnect(graph: Graph, handler: (...args: any[]) => void): Graph {
//     graph.setConnectHandler(handler);
//     if (graph.node) {
//       graph.node.connectionManager.on('peer:connect', graph.connectHandler);
//     }
//     return graph;
//   }

//   static onPeerDisconnect(graph: Graph, handler: (...args: any[]) => void): Graph {
//     graph.setDisconnectHandler(handler);
//     if (graph.node) {
//       graph.node.connectionManager.on('peer:disconnect', graph.disconnectHandler);
//     }
//     return graph;
//   }

//   static async sendFile(graph: Graph, to: PeerId, file: any): Promise<string> {
//     let node = graph.getNode();
//     const id = await FileProtocol.sendFile({ to, node, file });
//     return id;
//   }

//   static async receiveFile(graph: Graph, from: PeerId, id: string) {
//     let node = graph.getNode();
//     let content = '';
//     const decoder = new TextDecoder();
//     for await (const chunk of FileProtocol.receiveContent({ from, node, id })) {
//       content += decoder.decode(chunk);
//       console.log(content);
//     }
//     return content;
//   }

//   static async receiveMeta(graph: Graph, from: PeerId, id: string) {
//     let content = '';
//     let node = graph.getNode();
//     const meta = await FileProtocol.receiveMeta({ from, node, id });
//     content = JSON.stringify(
//       {
//         ...meta,
//         size: Number(meta.size),
//         lastModified: Number(meta.lastModified),
//       },
//       null,
//       2
//     );
//     return content;
//   }
// }
