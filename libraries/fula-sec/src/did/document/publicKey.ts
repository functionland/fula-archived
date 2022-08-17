import { SEPARATORS, isEquivalentId, createId } from './utils/index';
import { DuplicatePublicKey, InvalidPublicKey } from '../utils/errors';

const SEPARATOR = SEPARATORS.PUBLIC_KEY;
const REQUIRED = ['id', 'type', 'controller'];
const ENCODINGS = [
    'publicKeyPem',
    'publicKeyJwk',
    'publicKeyHex',
    'publicKeyBase64',
    'publicKeyBase58',
    'publicKeyMultibase',
];

const assertId = (publicKey: { id: string; }, publicKeys: any[]) => {
    const collision = publicKeys.some((key: { id: string; }) => isEquivalentId(key.id, publicKey.id, SEPARATOR));

    if (collision) {
        throw new DuplicatePublicKey(publicKey.id);
    }
};

const assertRequired = (publicKey: { [x: string]: any; }) => {
    REQUIRED.forEach((key) => {
        if (!publicKey[key]) {
            throw new InvalidPublicKey(`PublicKey requires \`${key}\` to be defined.`);
        }
    });
};

const assertEncodings = (publicKey: {}) => {
    const encodings = Object.keys(publicKey).filter((key) => key.includes('publicKey'));

    if (encodings.length !== 1) {
        throw new InvalidPublicKey('Property prefixed by `publicKey` is required and must be unique');
    }

    if (!ENCODINGS.includes(encodings[0])) {
        throw new InvalidPublicKey(`Encoding \`${encodings[0]}\` is invalid`);
    }
};

const assert = (publicKey: any, publicKeys: any) => {
    assertId(publicKey, publicKeys);
    assertRequired(publicKey);
    assertEncodings(publicKey);
};

export default {
    assert,
    separator: SEPARATOR,
    createId: (did: string, fragment: string, options: { prefix?: "" | undefined; }) => createId(did, fragment, SEPARATOR, options),
};
