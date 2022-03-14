import test from 'tape';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import {createClient} from '../src';
import {Status} from "../src/connection";

const serverId = '12D3KooWBFCDpMyEmyfnjhY6PiQw2vaM35ChTZ8ZmVUe8GFRMUrt';

const testFile = new File(['test'], 'test', {
    lastModified: 1639579330347,
    type: 'text/plain'
});

async function* testFileGenerator() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const reader = testFile.stream().getReader();
    while (true) {
        const {value, done} = await reader.read();
        if (done) {
            break;
        }
        yield value;
    }
}

test('Setup', async function (t) {
  t.plan(7);
  try {
    const client = await createClient();
    t.pass('Client ready');
    const connection = await client.connect(serverId);

    t.ok(connection.status === Status.Connecting || connection.status === Status.Online, 'node should start connecting')
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
            {_id: "6", age: 33, name: "joe", key: "6"},
            {_id: "8", age: 40, name: "eddy", key: "8"}
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
            const sorted = partialRes.data.read.sort((a, b) => parseInt(a._id)-parseInt(b._id))
            t.deepEqual(sorted, createSampleData.slice(0, cnt),`response #${cnt+1} must be correct`)
            if(cnt<createSampleData.length) {
                const toCreate = createSampleData.slice(cnt, cnt + 1)
                const createRes = await client.graphql(createSampleQuery, {values: toCreate})
                t.deepEqual(createRes, {data: {create: toCreate}}, `should create item #${cnt + 1}`)
            }
            cnt += 1
        }

        client.close();
    } catch (e) {
        t.error(e);
    }

});
