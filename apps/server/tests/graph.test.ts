import test from 'tape';
import { main, graceful, getLibp2p, getIPFS, getOrbitDb } from '../src/app';
import {queryResultMap, testData, testFile} from "./test-data";
import {connect, createClient} from "./helper";
import {PROTOCOL, submitQuery, Request, Result} from "@functionland/graph-protocol";



test('Graphgql on OrbitDB test', async function (t) {
  try {
    main().catch((e) => {
      t.fail(e);
    });
    const node = await getLibp2p();
    const ipfs = await getIPFS();
    const orbitDB = await getOrbitDb();
    // t.comment('Start Insert Sample Data')
    const db = await orbitDB.docs('profile');
    await db.load();
    await db.drop();
    await db.load();
    const promises = testData.map((obj) =>
      db.put({
        _id: obj.key,
        ...obj
      })
    );
    const addedList = await Promise.all(promises).catch((error) =>
      t.fail(error)
    );
    t.pass(`Sample Data Inserted ${JSON.stringify(addedList, null, 2)}`);

    //Connect Client node to Box
    const clientNode =  await createClient();
    const conn = await connect(clientNode,node);
    t.pass('connected')

    for(const testData of queryResultMap){
      const stream = await conn.newStream(PROTOCOL);
      const req: Request = Request.fromJson(
          {
            query:testData.query,
            operationName: null,
            variableValues: null
          }
      )
      const expected = await submitQuery({
        connection: stream,
        req
      });
      t.deepEqual(Result.toJson(<Result>expected), testData.expected, `should pass ${testData.name} query`)
    }
    t.end();

  } catch (error) {
    console.log('error', error);
    t.end(error);
  }
  t.teardown(graceful)
});
