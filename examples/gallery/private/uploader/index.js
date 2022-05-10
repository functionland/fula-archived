const {createClient} = require("@functionland/fula");
const fs=require('fs');
const { File } =  require("@web-std/file")
const wrtc = require("wrtc")


const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 -i [input-file] --boxid [Box ID] -p ./swarm.key')
  .demandOption(['i'], 'Please specify folder path')
  .demandOption(['p'], 'Please specify swarm-key')
  .demandOption(['boxid'], 'Please specify the Box ID that you would like to connect to.')
  .argv;

const PHOTOS_PATH= argv.i
const BOX_ID = argv.boxid
const PKEY_PATH = argv.p

const netSecret = fs.readFileSync(PKEY_PATH)


async function main() {
  const fula = await createClient({wrtc,netSecret})
  console.log("BoxID:",BOX_ID)
  const conn = fula.connect(BOX_ID)
  conn.on('connected',async ()=>{
    for await (const file of readFiles(PHOTOS_PATH)) {
      await upload(fula, file)
    }
    console.log("done")
    fula.close()
    process.exit();
  })


}


async function* readFiles(path) {
  const fileNames = await fs.promises.readdir(PHOTOS_PATH)
  console.log(fileNames)
  for (const fileName of fileNames){
    console.log(fileName)
    const buffer = await fs.promises.readFile(PHOTOS_PATH + fileName)
    yield new File([buffer],'fileName')
  }
}

const upload = async (fula, file) => {
  try {
    const cid = await fula.sendFile(file)
    await fula.graphql(createMutation, {values: [{cid, _id: cid}]})
  } catch (e) {
    console.log(e.message)
  }
}

const createMutation = `
  mutation addImage($values:JSON){
    create(input:{
      collection:"gallery",
      values: $values
    }){
      cid
    }
  }
`;

main()
