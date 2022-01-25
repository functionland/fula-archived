import test from 'tape';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { createClient } from '../src';

const serverId = 'QmasMjMGPNuAtwMsAR4cNPV5jGYiFLjcNzJy1k38ukXSTS';

const testFile = new File(['test'], 'test', {
  lastModified: 1639579330347,
  type: 'text/plain'
});

async function* testFileGenerator() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const reader = testFile.stream().getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    yield value;
  }
}

test('Setup', async function (t) {
  t.plan(6);
  try {
    const client = await createClient();
    t.pass('Client ready');
    const node = client.getNode();
    try{

      const isConnected = await client.connect(serverId);
    } catch (e) {
      console.log(e)
    }
    // t.ok(isConnected, 'Client Connected');
    const fileId = await client.sendFile(testFile);
    t.equal(typeof fileId, 'string');
    const fileId2 = await client.sendStreamFile(testFileGenerator(), {
      name: testFile.name,
      type: testFile.type,
      size: testFile.size,
      lastModified: testFile.lastModified
    });
    t.equal(fileId, fileId2);
    const meta = await client.receiveMeta(fileId);
    t.deepEqual(
      meta,
      {
        name: testFile.name,
        type: testFile.type,
        size: testFile.size,
        lastModified: testFile.lastModified
      },
      'Meta Most be Same'
    );
    const file = await client.receiveFile(fileId);
    t.deepEqual(
      {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      },
      {
        name: testFile.name,
        type: testFile.type,
        size: testFile.size,
        lastModified: testFile.lastModified
      },
      'Meta Most be Same'
    );
    t.equal(
      await file.text(),
      await testFile.text(),
      'Content Most be the same'
    );

    client.close();
  } catch (e) {
    t.error(e);
  }

});
