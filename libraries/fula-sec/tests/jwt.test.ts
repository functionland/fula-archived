// test access token .ts
import { expect, should } from 'chai';
import {getPublicJWK, getPrivateJWK} from '../src/access/elliptic.key'
import * as jose from 'jose'
import {FulaDID, TaggedEncryption} from "../src/index"

describe('JWT TEST', () => {
    it('1', async () => {
        // const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
        // let jwk = getPublicJWKfromPrivateKey(privateKey)
        // console.log('jwk: ', jwk)
        
        // const IpublicJWK = await jose.importJWK(jwk, 'ES256')
        // console.log('IpublicJWK: ', IpublicJWK)


        // const prJWK = getPrivateJWK(privateKey)
        // console.log('prJWK: ', prJWK)

        // const IprivateJwk = await jose.importJWK(prJWK, 'ES256')
        // console.log('IprivateJwk: ', IprivateJwk)

        // const privateJwk = await jose.exportJWK(IprivateJwk)
        // console.log('privateJwk: ', privateJwk)
        // should().not.Throw
    });

    it('2', async () => {
        // const fulaDID = new FulaDID();
        // const result = await fulaDID.create();
        // console.log('fulaDID: ', result)
        // let jwk = getPublicJWKfromPrivateKey(result.privateKey)
        // console.log('jwk: ', jwk)
        
        // const IpublicJWK = await jose.importJWK(jwk, 'ES256')
        // console.log('IpublicJWK: ', IpublicJWK)


        // const prJWK = getPrivateJWK(result.privateKey)
        // console.log('prJWK: ', prJWK)

        // const IprivateJwk = await jose.importJWK(prJWK, 'ES256')
        // console.log('IprivateJwk: ', IprivateJwk)

        // const privateJwk = await jose.exportJWK(IprivateJwk)
        // console.log('privateJwk: ', privateJwk)

        // let Pubjwk = getPublicJWK('0x420b8bd2afdfa344dc4029f991df08d540336407')
        // console.log('Pubjwk: ', Pubjwk)

        // should().not.Throw
    });


    // it('2- Add DID address to encrypt', async () => {
    //     const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
    //     const prJWK = getPrivateJWK(privateKey)
    //     console.log('prJWK: ', prJWK)

    //     const IprivateJwk = await jose.importJWK(prJWK, 'ES256K')
    //     console.log('IprivateJwk: ', IprivateJwk)
      
    //     const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
    //     .setProtectedHeader({ alg: 'ES256K' })
    //     .setIssuedAt()
    //     .setIssuer('urn:example:issuer')
    //     .setAudience('urn:example:audience')
    //     .setExpirationTime('2h')
    //     .sign(IprivateJwk)
     
    //      console.log(jwt)


    //     let jwk = getPublicJWK(privateKey)
    //     console.log('jwk: ', jwk)

    //     const IpublicJWK = await jose.importJWK(jwk, 'ES256K')
    //     console.log('IpublicJWK: ', IpublicJWK)


    //     jose.jwtVerify(jwt, IpublicJWK, {
    //         issuer: 'urn:example:issuer',
    //         audience: 'urn:example:audience'
    //     })
    //     .then((res)=> console.log('res: >>', res))
    //     .catch((err) => console.log("err: >>", err ))

    //     should().not.Throw
    // });


    // it('3- Add DID address to encrypt', async () => {
    //     const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
    //     let jwk = getPublicJWK(privateKey)
    //     console.log('jwk: ', jwk)

    //     const IpublicJWK = await jose.importJWK(jwk, 'ES256K')
    //     console.log('IpublicJWK: ', IpublicJWK)

    //     let jwt = "eyJhbGciOiJFUzI1NksifQ.eyJhbGciOiJFUzI1NksifQ.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjUzMjQ2Mjk5LCJpc3MiOiJ1cm46ZXhhbXBsZTppc3N1ZXIiLCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSIsImV4cCI6MTY1MzI1MzQ5OX0.fMNMEvxDgJKznawrx54_X3Y8MhIKKQWAHaG032j4_1u_xC7UjWrYpKKDcItOXaDGJpf7XyLpt7h5lqxBpzqgJA"    

    //     jose.jwtDecrypt(jwt, IpublicJWK, {
    //         issuer: 'urn:example:issuer',
    //         audience: 'urn:example:audience'
    //     })
    //     .then((res)=> console.log('res: >>', res))
    //     .catch((err) => console.log("err: >>", err ))
    //     should().not.Throw
    //     });


  });
