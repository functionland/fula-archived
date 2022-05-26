import { ec as EC } from 'elliptic'
import { hexToBytes, bytesToBase64url } from '../utils/u8a.multifoamats'

export function getFromPrivateJWK(_privateKey: string) {
    const secp256k1 = new EC('secp256k1')
    const kp = secp256k1.keyFromPrivate(_privateKey)
    return  {
      crv: 'secp256k1',
      kty: 'EC',
      x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
      y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
    }
}

export function getPublicJWK(_publicKey: string) {
  const secp256k1 = new EC('secp256k1')
  const kp = secp256k1.keyFromPublic(_publicKey)
  return  {
    crv: 'secp256k1',
    kty: 'EC',
    x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
    y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
  }
}

export function getPrivateJWK(_privateKey: string) {
  const secp256k1 = new EC('secp256k1')
  const kp = secp256k1.keyFromPrivate(_privateKey)
  const privateKey = String(kp.getPrivate('hex'))
  
 /* privateJwk:  {
    kty: 'EC',
    crv: 'P-256',
    x: '7E0r47-jxDft4-nk_YEJfSMYKHO3iSGML7cor-8eJEE',
    y: 'vOz2h6ivINceJ43wZZTONn-aWx48q-oDXzcmDP3vrR0',
    d: 'igF6JY5QeQZEpBf07lC9AooUh_jlXKQCL6m7hD4Veds'
  }*/

  return  {
    crv: 'secp256k1',
    kty: 'EC',
    x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
    y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
    d: bytesToBase64url(hexToBytes(privateKey)),
  }
  
}
