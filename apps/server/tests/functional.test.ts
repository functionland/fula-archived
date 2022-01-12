import test from 'tape';
import { main, graceful, getLibp2p, getIPFS,getOrbitDb } from '../src/app';
import Libp2p from 'libp2p';
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
import wrtc from 'wrtc';
import Mplex from 'libp2p-mplex';
import { File, Blob } from '@web-std/file';
import { FileProtocol } from '@functionland/file-protocol';

const noise = new Noise();

const testFile = new File(['test'], 'test', {
  lastModified: 1639579330347,
  type: 'text/plain'
});

async function* testFileGenerator(){
  const reader = (testFile.stream() as unknown as ReadableStream).getReader();
  while (true) {
    const {value, done} = await reader.read();
    if (done) {
      break;
    }
    yield value;
  }
}

export const createClient = async () =>
  Libp2p.create({
    addresses: {
      listen: [
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
      ]
    },
    modules: {
      transport: [WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE]
    },
    config: {
      transport: {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc // You can use `wrtc` when running in Node.js
        }
      },
      peerDiscovery: {
        autoDial: false,
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          enabled: false
        }
      }
    }
  });

// test('Test Server Functionality', async function (t) {
//   t.plan(7);
//   // create borg server
//   main().catch((e) => {
//     t.fail(e);
//   });
//   const node = await getLibp2p();
//   const ipfs = await getIPFS();
//   const client = await createClient();

//   await client.start();
//   try {
//     node.multiaddrs.map(x=>{
//       console.log(x)
//       console.log(node.peerId.toB58String())
//     })
//     console.log(ipfs.swarm.localAddrs)
//     client.peerStore.addressBook.set(node.peerId, node.multiaddrs);
//     const conn = await client.dial(await node.peerId);
//     t.pass('connection ready');
//     let stream = await conn.newStream(FileProtocol.PROTOCOL);
//     const fileId = await FileProtocol.sendFile({
//       connection: stream,
//       file: testFile
//     });
//     t.equal(typeof fileId, 'string', 'Test sendingFile API');
//     stream = await conn.newStream(FileProtocol.PROTOCOL);
//     const fileId2 = await FileProtocol.streamFile({
//       connection: stream,
//       source: testFileGenerator(),
//       meta: {
//         name: testFile.name,
//         type: testFile.type,
//         size: testFile.size,
//         lastModified: testFile.lastModified
//       }
//     });
//     t.equal(typeof fileId2, 'string', 'Test streamFile API');
//     t.equal(fileId, fileId2, 'Same File Most have Same Ids');
//     stream = await conn.newStream(FileProtocol.PROTOCOL);
//     const meta = await FileProtocol.receiveMeta({
//       connection: stream,
//       id: fileId
//     });
//     t.deepEqual(meta, {
//       name: testFile.name,
//       type: testFile.type,
//       size: testFile.size,
//       lastModified: testFile.lastModified
//     },"Meta Most be Same");

//     stream = await conn.newStream(FileProtocol.PROTOCOL)
//     const source =  FileProtocol.receiveContent({connection: stream, id: fileId})
//     const content: Array<Uint8Array> = [];
//     for await (const chunk of source) {
//       content.push(Uint8Array.from(chunk));
//     }
//     const file = new File(
//         [new Blob(content)], meta.name, {type: meta.type, lastModified: meta.lastModified});
//     const buf = await file.text()
//     const testBuf = await testFile.text()
//     t.equal(buf, testBuf,"Test receiveContent. What we send is what we get")

//   } catch (e) {
//     t.error(e);
//   }

//   // init
//   t.teardown(async () => {
//     await client.stop();
//     await graceful();
//   });

//   t.pass('clean exit')
// });
