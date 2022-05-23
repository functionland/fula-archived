import { ec as EC } from 'elliptic'
import { bytesToBase58, bytesToBase64, hexToBytes, bytesToBase64url } from '../utils/index'



export function getPublicJWK(privateKey: string) {
    const secp256k1 = new EC('secp256k1')
    // const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
    const kp = secp256k1.keyFromPrivate(privateKey)
    const publicKey = String(kp.getPublic('hex'))
    const compressedPublicKey = String(kp.getPublic().encode('hex', true))
    const publicKeyBase64 = bytesToBase64(hexToBytes(publicKey))
    const publicKeyBase58 = bytesToBase58(hexToBytes(publicKey))
    
    return  {
      crv: 'secp256k1',
      kty: 'EC',
      x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
      y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
    }
}

export function getPrivateJWK(_privateKey: string) {
  const secp256k1 = new EC('secp256k1')
  // const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
  const kp = secp256k1.keyFromPrivate(_privateKey)
  const privateKey = String(kp.getPrivate('hex'))
  const compressedPublicKey = String(kp.getPrivate())
  const publicKeyBase64 = bytesToBase64(hexToBytes(privateKey))
  const publicKeyBase58 = bytesToBase58(hexToBytes(privateKey))
  
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
