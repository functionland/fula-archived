import test from 'tape';
import {createClient, Status} from '@functionland/fula';
import {FileTest, GraphQL, GraphQLSubscription} from "./test-data";
import wrtc from "wrtc"
import * as process from "process";

let TIMEOUT
let serverIds

const beforeRun = ()=>{
  if(process.env.SERVER_ID){
    serverIds = process.env.SERVER_ID
  }else {
    throw Error(`Provide env variable SERVER_ID` )
  }

  if(process.env.TIMEOUT){
    TIMEOUT = process.env.TIMEOUT
  }
  else {
    TIMEOUT = 5 * 10000
  }
}



test('Setup', async function (t) {
  // test env variable provided
  beforeRun()
  // How many test going to be
  t.plan(16);

  // Start FULA Client
  t.comment("Starting fula client")
  const client = await createClient({wrtc: wrtc})
  t.pass('Client ready');

  // Connecting Client in Timeout Second
  t.comment("Start Establishing Connection")
  const connection = client.connect(serverIds);
  t.ok(connection.status === Status.Connecting, `Connection Status Should be change to ${Status.Connecting.toString()}`)

  await new Promise((resolve, reject) => {
    connection.once('connected', (connection) => {
      resolve(connection)
    })
    setTimeout(() => {
      t.fail("Connot Connect to box in " + TIMEOUT/10000 + " Second" )
      reject("Timeout")
    }, TIMEOUT)
  })


  t.pass('Client Connected');


  t.comment("Start Testing File API")
  const fileId = await client.sendFile(FileTest.testFile);
  t.equal(typeof fileId, 'string', `file uploaded with ${fileId}`);

  const fileId2 = await client.sendStreamFile(FileTest.testFileGenerator(), {
    name: FileTest.testFile.name,
    type: FileTest.testFile.type,
    size: FileTest.testFile.size,
    lastModified: FileTest.testFile.lastModified
  });
  t.equal(fileId, fileId2, `file ids most be the same ${fileId}`);
  const meta = await client.receiveMeta(fileId);
  t.deepEqual(
    meta,
    {
      name: FileTest.testFile.name,
      type: FileTest.testFile.type,
      size: FileTest.testFile.size,
      lastModified: FileTest.testFile.lastModified
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
      name: FileTest.testFile.name,
      type: FileTest.testFile.type,
      size: FileTest.testFile.size,
      lastModified: FileTest.testFile.lastModified
    },
    'Meta Most be Same'
  );
  t.equal(
    await file.text(),
    await FileTest.testFile.text(),
    'Content Most be the same'
  );

  t.comment("Testing Encryption File API")
  const {cid: encFileId, key} = await client.sendEncryptedFile(FileTest.testFile)
  t.equal(typeof encFileId, 'string', `file encrypted and uploaded with cid: ${encFileId}`)

  const decFile = await client.receiveDecryptedFile(encFileId, key.symKey, key.iv)
  t.equal(await decFile.text(), await FileTest.testFile.text(), 'incoming file should decrypt correctly')


  // Test GraqhQL
  t.comment("Start Testing GraqhQL With Insert")
  const result = await client.graphql(GraphQL.query)
  t.deepEqual(result, GraphQL.expected, 'Graphql using query')


  /*
  test graphqlSubscribe()
   */
  t.comment("Start Testing GraphQL Subscription")
  const readQuery = GraphQLSubscription.readQuery
  const createSampleData = GraphQLSubscription.sampleData
  const createSampleQuery = GraphQLSubscription.createSampleQuery
  const readResult = client.graphqlSubscribe(readQuery)


  let cnt = 0
  for await (const partialRes of readResult) {
    const sorted = partialRes.data.read.sort((a, b) => parseInt(a._id) - parseInt(b._id))
    t.deepEqual(sorted, createSampleData.slice(0, cnt), `response #${cnt + 1} must be correct`)
    if (cnt < createSampleData.length) {
      const toCreate = createSampleData.slice(cnt, cnt + 1)
      const createRes = await client.graphql(createSampleQuery, {values: toCreate})
      t.deepEqual(createRes, {data: {create: toCreate}}, `should create item #${cnt + 1}`)
    } else {
      break;
    }
    cnt += 1
  }

  t.teardown(() => {
    client.close()
  })

});

test.onFinish(()=>{
  process.exit(0)
})

test.onFailure(()=>{
  process.exit(1)
})
