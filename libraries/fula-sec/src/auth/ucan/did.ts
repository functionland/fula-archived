import * as UCAN from "./ucan.js"
import { base58btc } from "multiformats/bases/base58"
import { varint } from "multiformats"

const DID_KEY_PREFIX = `did:key:`
export const ED25519 = 0xed
export const RSA = 0x1205

/**
 * @param {Uint8Array} key
 * @returns {Code}
 */
// CHANGED
export const algorithm = key => {
    const algorithmByMulticoded = bytes => {
        const [code] = varint.decode(bytes)
        switch (code) {
            case ED25519:
            case RSA:
                return code
            default:
                throw new RangeError(
                    `Unsupported key algorithm with multicode 0x${code.toString(16)}.`
                )
        }
    }
    if (key instanceof Uint8Array) {
        return algorithmByMulticoded(key)
    } else {
        const parsed = from(key)
        return algorithmByMulticoded(parsed)
    }
}

/**
 * @typedef {typeof ED25519|typeof RSA} Code
 */

/**
 * @param {UCAN.DID} did
 * @returns {UCAN.DIDView}
 */
export const parse = did => {
    if (!did.startsWith(DID_KEY_PREFIX)) {
        throw new RangeError(`Invalid DID "${did}", must start with 'did:key:'`)
    }
    return decode(base58btc.decode(did.slice(DID_KEY_PREFIX.length)))
}

/**
 * @param {UCAN.ByteView<UCAN.DID>} key
 * @returns {UCAN.DID}
 */
// CHANGED
export const format = key => {
    if (key instanceof Uint8Array) {
        return (`${DID_KEY_PREFIX}${base58btc.encode(encode(key))}`)
    } else if (typeof key === 'string') {
        return key
    } else {
        throw new Error(`Not supported key ${key}`)
    }
}


/**
 * @param {Uint8Array} bytes
 * @returns {UCAN.DIDView}
 */
export const decode = bytes => {
    const _ = algorithm(bytes)
    return new DID(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

/**
 * @param {Uint8Array} bytes
 * @returns {UCAN.ByteView<UCAN.DID>}
 */
export const encode = bytes => {
    const _ = algorithm(bytes)
    return bytes
}

/**
 * @param {UCAN.ByteView<UCAN.DID>|UCAN.DID} input
 * @returns {UCAN.DIDView}
 */
export const from = input => {
    if (input instanceof DID) {
        return input
    } else if (input instanceof Uint8Array) {
        return decode(input)
    } else {
        return parse(input)
    }
}

class DID extends Uint8Array {
    did() {
        return format(this)
    }
}