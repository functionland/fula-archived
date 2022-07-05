import tape from 'tape';
import {app, getLibp2p} from '../src/app';
import {File, Blob} from '@web-std/file';
import {FileProtocol} from '@functionland/file-protocol';
import {connect, createClient} from "./helper";
import {testFile, testFileGenerator} from "./test-data";

let p = undefined;

tape('Setup Box', async function (t) {
  p = await app()
})


tape('Test Server Functionality', async function (t) {

  t.plan(9);

  const node = await getLibp2p();
  const client = await createClient();

  t.comment(`Test client created with PeerID: ${client.peerId}`);
  await client.start();
  t.comment(`Test client created with PeerID: ${client.peerId}`);

  const conn = await connect(client, node)
  t.pass('connection ready');
  let stream = await conn.newStream(FileProtocol.PROTOCOL);
  t.pass('stream created')
  const fileId = await FileProtocol.sendFile({
    connection: stream,
    file: testFile
  });
  t.equal(typeof fileId, 'string', 'Test sendingFile API');
  stream = await conn.newStream(FileProtocol.PROTOCOL);
  t.pass('stream created')
  const fileId2 = await FileProtocol.streamFile({
    connection: stream,
    source: testFileGenerator(),
    meta: {
      name: testFile.name,
      type: testFile.type,
      size: testFile.size,
      lastModified: testFile.lastModified
    }
  });
  t.equal(typeof fileId2, 'string', 'Test streamFile API');
  t.equal(fileId, fileId2, 'Same File Most have Same Ids');
  stream.stream.close()
  stream = await conn.newStream(FileProtocol.PROTOCOL);
  const meta = await FileProtocol.receiveMeta({
    connection: stream,
    id: fileId
  });
  t.deepEqual(meta, {
    name: testFile.name,
    type: testFile.type,
    size: testFile.size,
    lastModified: testFile.lastModified
  }, "Meta Most be Same");
  stream.stream.close()
  stream = await conn.newStream(FileProtocol.PROTOCOL)
  const source = FileProtocol.receiveContent({connection: stream, id: fileId})
  const content: Array<Uint8Array> = [];
  for await (const chunk of source) {
    content.push(Uint8Array.from(chunk));
  }
  const file = new File(
    [new Blob(content)], meta.name, {type: meta.type, lastModified: meta.lastModified});
  const buf = await file.text()
  const testBuf = await testFile.text()
  t.equal(buf, testBuf, "Test receiveContent. What we send is what we get")
  stream.stream.close()

  t.teardown(async () => {
    await client.stop()
  })

  t.pass("Test Ended")
  t.end()
});

tape.onFinish(async () => {
  await p.stop();
  process.exit(0)
})
