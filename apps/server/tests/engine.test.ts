import test from 'tape';
import {OperationDefinitionNode, parse} from 'graphql';
import {getCollection, getFields, getFilter} from '../src/engine'

const qString = `
  query  { profile (filter: { 
    name: { ne: "mehdi" },
    age: { gt: 28 }
    }){
      name
      age
      }
    }  
`;
const q = parse(qString)

const docs = [
  {
    name: 'mahdi',
    age: 20
  },
  {
    name: 'farhoud',
    age: 30
  },
  {
    name: 'keyvan',
    age: 40
  },
  {
    name: 'mehdi',
    age: 50
  }

]

test('test engine', async function (t) {
    const def = q.definitions[0] as OperationDefinitionNode

    t.equal(getCollection(def), "profile", `collection name should be equal`)
    t.equal(getFilter(def)(docs[0]), false, "filter for docs[0] should return false")
    t.equal(getFilter(def)(docs[1]), true, "filter for docs[1] should return true")
    t.equal(getFilter(def)(docs[2]), true, "filter for docs[2] should return true")
    t.equal(getFilter(def)(docs[3]), false, "filter for docs[3] should return false")
    t.deepEqual(getFields(def), ['name','age'], "fields should be equal")
    t.end()
    // t.equal(filter, )
})

test('run Query', async function (t){

})
