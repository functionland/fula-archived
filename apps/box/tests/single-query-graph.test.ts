import test from 'tape';
import {app, getLibp2p, getIPFS, getOrbitDb} from '../src/app';
import {connect, createClient} from "./helper";
import {PROTOCOL, submitQuery, Request, Result} from "@functionland/graph-protocol";

const CNAME = 't'

const TEST = {
    query: `
  mutation addImage($values:JSON){
    create(input:{
      collection:"${CNAME}",
      values: $values
    }){
      _id
      name
    }
  }
`,
    variables: {
        values: [{_id: 1, name: 'batman'}]
    },
    expected: {
        data: {
            create: [{_id: 1, name: 'batman'}]
        }
    },
    operationName: null,
    subscribe: false
}

test('Test single graphql operation', async function (t) {
    t.plan(3)
    const p = await app();
    const clientNode = await createClient();
    try {
        const node = await getLibp2p();
        const ipfs = await getIPFS();
        const orbitDB = await getOrbitDb();
        const db = await orbitDB.docs(CNAME);
        await db.load();
        await db.drop();
        await db.load();

        t.pass(`loaded orbit-db docs with name ${CNAME}`)

        //Connect Client node to Box

        const conn = await connect(clientNode, node);
        t.pass('connected')

        const stream = await conn.newStream(PROTOCOL);
        const req: Request = Request.fromJson(
            {
                query: TEST.query,
                operationName: TEST.operationName,
                variableValues: TEST.variables,
                subscribe: TEST.subscribe
            }
        )
        const expected = await submitQuery({
            connection: stream,
            req
        })
        t.deepEqual(Result.toJson(<Result>expected), TEST.expected, `should pass TEST operation`)

    } catch (error) {
        console.log('error', error);
        t.end(error);
    }

    t.teardown(async () => {
        await p.stop()
        await clientNode.stop()
    })

    await new Promise(resolve => setTimeout(resolve, 10000));
    t.end()
});

test.onFinish (() => {process.exit (0)})
