const {createClient} = require("@functionland/fula");
const fs=require('fs');
const { File } =  require('@web-std/file');
const uuid = require('uuid');
const yargs = require('yargs')
var _ = require('lodash');
const wrtc = require("wrtc")


const argv = require('yargs/yargs')(process.argv.slice(2))
      .usage('Usage: $0 -i [input-file] --boxid [Box ID]')
      .demandOption(['i'], 'Please specify an input file')
      .demandOption(['boxid'], 'Please specify the Box ID that you would like to connect to.')
      .argv;

const DOC_PATH = argv.i

if(!fs.existsSync(DOC_PATH)) {
  console.error(`Input file ${DOC_PATH} does not exist.`)
  process.exit(1)
}

const BOX_ID = argv.boxid

if(!BOX_ID) {
  console.error(`Must specify a Box ID of the Box you are connecting to.`)
  process.exit(1)
}

async function setup() {

  const fula = await createClient({wrtc})

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
    console.log('Launch one of the following in the browser:')
    console.log('http://localhost:1234?meeting='+meetingCode)
    console.log('http://ipfs.io/ipfs/Qmde5F5VMPSku2bWiRPQPc4DVvWzXqcWJoDZbypTNNieNR?meeting='+meetingCode)
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
