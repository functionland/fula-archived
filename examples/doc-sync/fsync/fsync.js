const WebRTCStar = require('libp2p-webrtc-star');
const wrtc = require('wrtc');
const {createClient} = require("@functionland/fula");
const fs=require('fs');
const { File } =  require('@web-std/file');
const uuid = require('uuid');
const yargs = require('yargs')
var _ = require('lodash');


const argv = require('yargs/yargs')(process.argv.slice(2))
      .usage('Usage: $0 -i [input-file]')
      .demandOption(['i'])
      .argv;

const DOC_PATH = argv.i

if(!fs.existsSync(DOC_PATH)) {
  console.error(`Input file ${DOC_PATH} does not exist.`)
  process.exit(1)
}

const BOX_ID = process.env.BOX_ID


async function setup() {

  const fula = await createClient({
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
  })

  const conn = fula.connect(BOX_ID)

  const watchForUpdates = async (docPath, meetingCode) => {
    console.log('watching for updates... ')

    fs.watchFile(docPath, {interval:50}, _.debounce(async function(curr, prev) {
        if(curr.mtime!==prev.mtime) {
          console.log('updating...')
          const file = await readFile(DOC_PATH)
          await updateMeeting(fula, file, meetingCode)
        }
    }, 500))
  }



  conn.on('connected', async ()=> {
    const file = await readFile(DOC_PATH)
    const meetingCode = await createMeeting(fula, file)
    console.log('watching...')
    await watchForUpdates(DOC_PATH, meetingCode)
  })

}

const updateMeeting = async (fula, file, meetingCode) => {
  try {
    const cid = await fula.sendFile(file)
    await fula.graphql(updateMutation, {values: [{id:meetingCode, cid,}]})
    console.log('updated meeting')
  } catch (e) {
    console.log(e.message)
  }
}

const createMeeting = async (fula, file) => {
  const meetingCode = uuid.v4()
  try {
    const cid = await fula.sendFile(file)
    await fula.graphql(createMutation, {values: [{id:meetingCode, cid,}]})
    console.log('Your meeting code is : ' + meetingCode)
    console.log('Launch http://localhost:3000?meeting='+meetingCode)
    return meetingCode;
  } catch (e) {
    console.log(e.message)
  }
}

const createMutation = `
  mutation addMeeting($values:JSON){
    create(input:{
      collection:"meeting",
      values: $values
    }){
      cid,
    }
  }
`;

const updateMutation = `
  mutation updateMeeting($values:JSON){
    update(input:{
      collection:"meeting",
      values: $values
    }){
      id,
      cid
    }
  }
`;


async function readFile(path) {
  const buffer = await fs.promises.readFile(path)
  return new File([buffer],'fileName')
}

setup()
