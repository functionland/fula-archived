import {File} from "@web-std/file";

export const testData = [
    {
        key: '0',
        name: 'mahdi',
        age: 40
    },
    {
        key: '1',
        name: 'keyvan',
        age: 30
    },
    {
        key: '2',
        name: 'emad',
        age: 15
    },
    {
        key: '3',
        name: 'ehsan',
        age: 35
    },
    {
        key: '4',
        name: 'farhoud',
        age: 25
    },
    {
        key: '5',
        name: 'mehdi',
        age: 30
    }
];

export const queryResultMap = [
    {
        name: 'readAllProfiles',
        query: `query {
                  read(input: { collection: "profile", filter: {} }) {
                    _id
                    name
                    age
                    key
                  }  
               }`,
        expected: {
            data: {read: testData.map((obj) => ({_id: obj.key, ...obj}))}
        }
    },
    {
        name: 'read',
        query: `
              query {
                read(
                  input: {
                    collection: "profile"
                    filter: {
                      and: [{ name: { nin: ["keyvan", "mahdi"] } }, { age: { gt: 15 } }]
                    }
                  }
                ) {
                  _id
                  name
                }
              }
            `,
        expected: {
            data: {
                read: [
                    {_id: '3', name: 'ehsan'},
                    {_id: '4', name: 'farhoud'},
                    {_id: '5', name: 'mehdi'}
                ]
            }
        }
    },
    {
        name: 'create',
        query: `
          mutation {
            create(
              input: {
                collection: "profile"
                values: [{ _id: "6", age: 33, name: "jamshid", key: "6" }]
              }
            ) {
              _id
              name
              age
              key
            }
          }`,
        expected: {
            data: {create: [{_id: '6', name: 'jamshid', age: 33, key: '6'}]}
        }
    },
    {
        name: 'create',
        query: `
          mutation {
            create(
              input: {
                collection: "profile"
                values: [{ _id: "7", age: 35, name: "someone", key: "7" }]
              }
            ) {
              _id
              name
              age
              key
            }
          }`,
        expected: {
            data: {create: [{_id: '7', name: 'someone', age: 35, key: '7'}]}
        }
    },
    {
        name: 'create',
        query: `
          mutation {
            create(
              input: {
                collection: "profile"
                values: [{ _id: "8", age: 20, name: "ali", key: "8" }]
              }
            ) {
              _id
              name
              age
              key
            }
          }`,
        expected: {
            data: {create: [{_id: '8', name: 'ali', age: 20, key: '8'}]}
        },
        subscription: true
    },
    {
        name: 'create',
        query: `
          mutation {
            create(
              input: {
                collection: "profile"
                values: [{ _id: "9", age: 22, name: "taghi", key: "9" }]
              }
            ) {
              _id
              name
              age
              key
            }
          }`,
        expected: {
            data: {create: [{ _id: "9", age: 22, name: "taghi", key: "9" }]}
        },
        subscription: true
    },
    {
        name: 'update',
        query: `
              mutation {
                update(
                  input: {
                    collection: "profile"
                    values: [{ _id: "2", age: 18, name: "emad", key: "2" }]
                  }
                ) {
                  _id
                  name
                  age
                  key
                }
              }`,
        expected: {
            data: {update: [{_id: '2', name: 'emad', age: 18, key: '2'}]}
        }
    },

    {
        name: 'updateQuery',
        query: `
      mutation {
        updateQuery(
          input: {
            collection: "profile"
            filter: { age: { gt: 30 } }
            value: { age: 70 }
          }
        ) {
          _id
          name
          age
          key
        }
      }
    `,
        expected: {
            data: {
                updateQuery: [
                    {_id: '0', name: 'mahdi', age: 70, key: '0'},
                    {_id: '3', name: 'ehsan', age: 70, key: '3'},
                    {_id: '6', name: 'jamshid', age: 70, key: '6'},
                    {_id: '7', name: 'someone', age: 70, key: '7'}
                ]
            }
        }
    },
    {
        name: 'delete',
        query: `
          mutation {
            delete(input: { collection: "profile", ids: ["6"] }) {
              _id
              name
              age
              key
            }
          }
        `,
        expected: {
            data: {
                delete: ['6']
            }
        }
    },
    {
        name: 'readAllProfiles2',
        query: `
          query {
            read(input: { collection: "profile", filter: {} }) {
              _id
              name
              age
              key
            }
          }
        `,
        expected: {
            data: {
                read: [
                    {_id: '0', name: 'mahdi', age: 70, key: '0'},
                    {_id: '1', name: 'keyvan', age: 30, key: '1'},
                    {_id: '2', name: 'emad', age: 18, key: '2'},
                    {_id: '3', name: 'ehsan', age: 70, key: '3'},
                    {_id: '4', name: 'farhoud', age: 25, key: '4'},
                    {_id: '5', name: 'mehdi', age: 30, key: '5'},
                    {_id: '7', name: 'someone', age: 70, key: '7'}
                ]
            }
        }
    },
]


export const testFile = new File(['test'], 'test', {
    lastModified: 1639579330347,
    type: 'text/plain'
});

export async function* testFileGenerator() {
    const reader = (testFile.stream() as unknown as ReadableStream).getReader();
    while (true) {
        const {value, done} = await reader.read();
        if (done) {
            break;
        }
        yield value;
    }
}

export function* testEventGenerator() {
    const queries = queryResultMap.filter((qr) => qr.name === 'create' && qr.subscription === true)
    for (const _qr of queries)
        yield _qr
}
