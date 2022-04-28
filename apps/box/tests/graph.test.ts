import test from 'tape';
import {app, getLibp2p, getIPFS} from '../src/app';
import {getOrbitDb} from '../src/graph'
import {queryResultMap, testData, testEventGenerator} from "./test-data";
import {connect, createClient} from "./helper";
import {PROTOCOL, submitQuery, Request, Result, submitSubscriptionQuery} from "@functionland/graph-protocol";


test('Graphgql on OrbitDB test', async function (t) {
    t.plan(12)
    const p = await app();
    try {
        const node = await getLibp2p();
        const ipfs = await getIPFS();
        const orbitDB = await getOrbitDb();
        // t.comment('Start Insert Sample Data')
        const options = {
            // Give write access to ourselves
            accessController: {
                write: ['*']
            }
        }
        const db = await orbitDB.docs('profile', options);
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
        const clientNode = await createClient();
        const conn = await connect(clientNode, node);
        t.pass('connected')

        await db.load()

        for (const testData of queryResultMap) {
            if (testData.subscription)
                continue

            const stream = await conn.newStream(PROTOCOL);
            const req: Request = Request.fromJson(
                {
                    query: testData.query,
                    operationName: null,
                    variableValues: null,
                    subscribe: false
                }
            )
            const expected = await submitQuery({
                connection: stream,
                req
            })
            t.deepEqual(Result.toJson(<Result>expected), testData.expected, `should pass ${testData.name} query`)
        }

        const stream = await conn.newStream(PROTOCOL);
        const eventTestData = queryResultMap.filter((qr) => qr.name === 'readAllProfiles2')[0]
        const req: Request = Request.fromJson(
            {
                query: eventTestData.query,
                operationName: null,
                variableValues: null,
                subscribe: true
            }
        )
        const res = submitSubscriptionQuery({
            connection: stream,
            req
        });
        const events = testEventGenerator()

        let lastReadResult: Array<Result> = []
        let lastCreateResult: Result | null = null
        for await (const partialRes of res) {
            if (!partialRes)
                continue

            if (lastCreateResult)
                t.deepEqual(
                    Result.toJson(partialRes).data.read,
                    lastReadResult.concat(lastCreateResult).sort((a,b) => parseInt(a._id)-parseInt(b._id)),
                    'got created item')

            lastReadResult = Result.toJson(partialRes).data.read

            const evt = events.next().value
            if (!evt)
                break

            const _stream = await conn.newStream(PROTOCOL)
            const testReq = evt.query
            const req: Request = Request.fromJson({
                query: testReq,
                operationName: null,
                variableValues: null,
                subscribe: false
            })
            const createRes = await submitQuery({connection: _stream, req})
            lastCreateResult = Result.toJson(createRes).data.create
        }

    } catch (error) {
        console.log('error', error);
        t.end(error);
    }

    t.teardown(async () => {
        await p.stop()

    })

    await new Promise(resolve => setTimeout(resolve, 10000));
    t.end()
});
