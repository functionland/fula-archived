import {File} from "@web-std/file";



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
export const FileTest = {
  testFile,
  testFileGenerator
}
const cName = (Math.random() + 1).toString(36).substring(7)
const query = `mutation {
                    create(
                      input: {
                        collection: "${cName}"
                        values: [{ _id: "6", age: 33, name: "jamshid", key: "6" }]
                      }
                    ) {
                      _id
                      name
                      age
                      key
                    }
                  }`

const expected = {
  data: {create: [{_id: '6', name: 'jamshid', age: 33, key: '6'}]}
}

export const GraphQL={
  query,
  expected
}

const cNameSub = (Math.random() + 1).toString(36).substring(7)
// const cName = 'testC'
const createSampleQuery = `
      mutation addPerson($values:JSON){
        create(
          input: {
            collection: "${cNameSub}"
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
const sampleData = [
  {_id: "6", age: 33, name: "joe", key: "6"},
  {_id: "8", age: 40, name: "eddy", key: "8"}
]

const readQuery = `
            query {
              read(
                input: {
                  collection: "${cNameSub}"
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

export const GraphQLSubscription = {
  createSampleQuery,
  sampleData,
  readQuery
}
