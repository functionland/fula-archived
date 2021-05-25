import { bytes } from 'multiformats'
import { encode } from 'multiformats/block'
import * as raw from 'multiformats/codecs/raw'
import schema from './schema.js'
import createValidate from '@ipld/schema-validation'

const { isBinary } = bytes

const validate = createValidate(schema)
const isCID = o => o && typeof o === 'object' && o.asCID && o.asCID === o

const sum = (x, y) => x + y

const balanced = (limit = 1000) => async function * ({ parts, hasher, codec }) {
  parts = [...parts]
  if (parts.length > limit) {
    const size = Math.ceil(parts.length / Math.ceil(parts.length / limit))
    const subparts = []
    while (parts.length) {
      const chunk = parts.splice(0, size)
      const length = chunk.map(([l]) => l).reduce(sum)
      let last
      for await (const block of balanced(limit)({ parts: chunk, hasher, codec })) {
        yield block
        last = block
      }
      subparts.push([length, last.cid])
    }
    parts = subparts
  }
  validate(parts, 'FlexibleByteLayout')
  yield encode({ value: parts, codec, hasher })
}
const _balanced = balanced()
const fromIterable = async function * (gen, { hasher, codec, algo = _balanced }) {
  const parts = []
  for await (const buffer of gen) {
    const block = await encode({ value: buffer, codec: raw, hasher })
    yield block
    parts.push([buffer.byteLength, block.cid])
  }
  yield * algo({ parts, codec, hasher })
}
const size = block => {
  const data = block.asBlock === block ? block.value : block
  validate(data, 'FlexibleByteLayout')
  if (isBinary(data)) return data.byteLength
  return data.map(([l]) => l).reduce(sum)
}
const read = async function * (block, get, offset = 0, end = Infinity) {
  if (isCID(block)) block = await get(block)
  const decoded = block.asBlock === block ? block.value : block
  if (isBinary(decoded)) {
    const chunk = decoded.subarray(offset, end)
    yield chunk
    return
  }

  validate(decoded, 'FlexibleByteLayout')

  let i = 0
  for (const [length, link] of decoded) {
    if (i > end) return

    yield * read(link, get, offset > i ? offset - i : 0, end - i)

    i += length
  }
}

export { fromIterable, balanced, size, read }
