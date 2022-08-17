import {Povider} from './src/provider'
import { UnavailableIpfs } from '../../../src/did/utils/errors';

export const createProvider = (ipfs: any, { lifetime }:any = {}) => {
    if (typeof ipfs.isOnline === 'function' && !ipfs.isOnline()) {
        throw new UnavailableIpfs();
    }
    return new Povider(ipfs, lifetime);
};