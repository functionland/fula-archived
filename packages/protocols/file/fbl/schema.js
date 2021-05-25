export default {
  types: {
    FlexibleByteLayout: {
      kind: 'union',
      representation: {
        kinded: {
          bytes: 'Bytes',
          list: 'NestedByteList',
          link: {
            kind: 'link',
            expectedType: 'FlexibleByteLayout'
          }
        }
      }
    },
    NestedByteList: {
      kind: 'list',
      valueType: 'NestedByte'
    },
    NestedByte: {
      kind: 'union',
      representation: {
        kinded: {
          bytes: 'Bytes',
          list: 'NestedFBL'
        }
      }
    },
    NestedFBL: {
      kind: 'struct',
      fields: {
        length: {
          type: 'Int'
        },
        part: {
          type: 'FlexibleByteLayout'
        }
      },
      representation: {
        tuple: {}
      }
    }
  }
}
