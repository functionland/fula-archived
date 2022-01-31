import test from 'tape';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { createClient } from '../src';

const serverId = '12D3KooWGwcKB18qSsq3AxPw9nUfpEMyePAiA1q8gqq92yuWEKKt';

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
    const query = `mutation {
                    create(
                      input: {
                        collection: "profile"
                        values: [{ _id: "6", age: 33, name: "jamshid", key: "6" }]
                      }
                    ) {
                      _id
                      name
                      age
                      key
                    }
                  }`

    const result = await client.graphql(query)
    const expected = {
      data: {create: [{_id: '6', name: 'jamshid', age: 33, key: '6'}]}
    }
    t.deepEqual(result, expected, 'Graphql using query')
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
