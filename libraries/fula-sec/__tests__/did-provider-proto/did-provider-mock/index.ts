import {Povider} from './src/provider.js'
import { UnavailableIpfs } from '../../../src/did/utils/errors.js';

export const createProvider = (ipfs: any, secretKey: Uint8Array, { lifetime }:any = {}) => {
    if (typeof ipfs.isOnline === 'function' && !ipfs.isOnline()) {
        throw new UnavailableIpfs();
    }
    return new Povider(ipfs, lifetime, secretKey);
};