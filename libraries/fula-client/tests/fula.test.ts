import test from 'tape';
import { createClient } from '../src';
import { Status } from "../src/connection";
import { File } from '@web-std/file'


const serverIds = ['12D3KooWLdq1Cn7WxCD4rtyiJoHYoDsXDPEumkRvzqWgeLdnNWxg'];

const testFile = new File([`Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 Sagittis purus sit amet volutpat consequat mauris. Faucibus a pellentesque sit amet.
 Ornare suspendisse sed nisi lacus sed. Egestas integer eget aliquet nibh praesent tristique magna sit.
 Hac habitasse platea dictumst vestibulum rhoncus est. Amet dictum sit amet justo donec enim.
 Sit amet massa vitae tortor condimentum lacinia quis. Felis bibendum ut tristique et egestas quis ipsum suspendisse.
 Vulputate ut pharetra sit amet aliquam id diam maecenas ultricies.
 Ac tortor vitae purus faucibus.
 Sem et tortor consequat id porta nibh venenatis cras. Lacus suspendisse faucibus interdum posuere lorem ipsum dolor sit.
 Massa enim nec dui nunc mattis enim ut tellus elementum.
 Venenatis a condimentum vitae sapien pellentesque habitant.
 Adipiscing enim eu turpis egestas pretium aenean pharetra magna.
 Dictum fusce ut placerat orci nulla pellentesque.
 Ac placerat vestibulum lectus mauris.
 Integer feugiat scelerisque varius morbi`],
 'test', {
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
  t.plan(16);
  try {
    const client = await createClient()
    t.pass('Client ready');
    const connection = client.connect(serverIds);

    t.ok(connection.status === Status.Connecting, 'node should start connecting')

    const whenConnected = new Promise((resolve, reject) => {
      connection.once('connected', (connection) => {
        resolve(connection)
      })
    })
    await whenConnected


    t.pass('Client Connected');
    const fileId = await client.sendFile(testFile);
    t.equal(typeof fileId, 'string', `file uploaded with ${fileId}`);

    const {cid: encFileId, key} = await client.sendEncryptedFile(testFile)
    t.equal(typeof encFileId, 'string', `file encrypted and uploaded with cid: ${encFileId}`)

    const decFile = await client.receiveDecryptedFile(encFileId, key.symKey, key.iv)
    t.equal(await decFile.text(), await testFile.text(), 'incoming file should decrypt correctly')

    const fileId2 = await client.sendStreamFile(testFileGenerator(), {
      name: testFile.name,
      type: testFile.type,
      size: testFile.size,
      lastModified: testFile.lastModified
    });
    t.equal(fileId, fileId2, `file ids must be the same ${fileId}`);
    const meta = await client.receiveMeta(fileId);
    t.deepEqual(
      meta,
      {
        name: testFile.name,
        type: testFile.type,
        size: testFile.size,
        lastModified: testFile.lastModified
      },
      'Meta Must be the Same'
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
      `Content Must be the same for file ID ${fileId}`
    );
    const query = `mutation {
                    create(
                      input: {
                        collection: "testC"
                        values: [{ _id: "6", age: 33, name: "jamshid", key: "6", user: "ba7" }]
                      }
                    ) {
                      _id
                      name
                      age
                      key
                      user
                    }
                  }`

    const result = await client.graphql(query)
    const expected = {
      data: { create: [{ _id: '6', name: 'jamshid', age: 33, key: '6', user: 'ba7' }] }
    }
    t.deepEqual(result, expected, 'Graphql using query')

    /*
    test graphqlSubscribe()
     */
    const cName = (Math.random() + 1).toString(36).substring(7)
    // const cName = 'testC'
    const createSampleQuery = `
      mutation addPerson($values:JSON){
        create(
          input: {
            collection: "${cName}"
            values: $values
          }
        ) {
          _id
          name
          age
          key
        }
      }
    `
    const createSampleData = [
      { _id: "6", age: 33, name: "joe", key: "6" },
      { _id: "8", age: 40, name: "eddy", key: "8" }
    ]

    const readQuery = `
            query {
              read(
                input: {
                  collection: "${cName}"
                  filter: {}
                }
              ){
              _id
              name
              age
              key
              }
            }
        `
    const readResult = client.graphqlSubscribe(readQuery)

    let cnt = 0
    for await (const partialRes of readResult) {
      const sorted = partialRes.data.read.sort((a, b) => parseInt(a._id) - parseInt(b._id))
      t.deepEqual(sorted, createSampleData.slice(0, cnt), `response #${cnt + 1} must be correct`)
      if (cnt < createSampleData.length) {
        const toCreate = createSampleData.slice(cnt, cnt + 1)
        const createRes = await client.graphql(createSampleQuery, { values: toCreate })
        t.deepEqual(createRes, { data: { create: toCreate } }, `should create item #${cnt + 1}`)
      }
      cnt += 1
    }

    await client.close();
  } catch (e) {
    t.error(e);
  }
  t.end()
});

// test.onFinish(() => { process.exit(0) })
