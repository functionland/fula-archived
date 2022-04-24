const {createClient} = require("@functionland/fula");
const fs=require('fs');
const { File } =  require("@web-std/file")

const PHOTOS_PATH= './scripts/photos/'
const BOX_ID = process.env.BOX_ID


async function main() {
  const fula = await createClient()

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
