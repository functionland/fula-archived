import { derivePath, getMasterKeyFromSeed, getPublicKey } from '../../src/did/hkey/index.js';
const hexSeed = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';

// const { key, chainCode } = getMasterKeyFromSeed(hexSeed);
// console.log(key.toString('hex'))
// // => 2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7
// console.log(chainCode.toString('hex'));
// // => 90046a93de5380a72b5e45010748567d5ea02bbf6522f979e05c0d8d8ca9fffb


const { key, chainCode} = derivePath("m/0'/1'", hexSeed);

console.log(key.toString('hex'))
// => ea4f5bfe8694d8bb74b7b59404632fd5968b774ed545e810de9c32a4fb4192f4
console.log(chainCode.toString('hex'));
// => 138f0b2551bcafeca6ff2aa88ba8ed0ed8de070841f0c4ef0165df8181eaad7f

console.log(getPublicKey(key).toString('hex'))
// => 005ba3b9ac6e90e83effcd25ac4e58a1365a9e35a3d3ae5eb07b9e4d90bcf7506d