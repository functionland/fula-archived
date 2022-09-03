import _ from 'lodash'; //{ _.isString, _.isPlainObject }
import { generateRandomString, isDidValid } from '../../utils/index.js';
import { InvalidDocument, InvalidIdPrefix } from '../../utils/errors.js';

const DEFAULT_CONTEXT = 'https://w3id.org/did/v1';
export const SEPARATORS = {
    PUBLIC_KEY: '#',
    SERVICE: ';',
};

export const createId = (did: string, fragment: string | Promise<string>, separator: string, options: any) => {
    const { prefix = '' } = { ...options };

    if (typeof prefix !== 'string' || Object.values(SEPARATORS).some((sep) => prefix.includes(sep))) {
        throw new InvalidIdPrefix();
    }

    fragment = fragment || generateRandomString();

    return `${did}${separator}${prefix}${fragment}`;
};

export const isEquivalentId = (id1, id2, separator) => {
    if (!_.isString(id1) || !_.isString(id2)) {
        return false;
    }

    id1 = id1.includes(separator) ? id1.split(separator)[1] : id1;
    id2 = id2.includes(separator) ? id2.split(separator)[1] : id2;

    return id1 === id2;
};

export const generateDocument = (did) => ({
    '@context': DEFAULT_CONTEXT,
    id: did,
    created: new Date().toISOString(),
});

export const assertDocument = (content) => {
    if (!_.isPlainObject(content)) {
        throw new InvalidDocument('Document content must be a plain object.');
    }

    const { '@context': context, id } = content;

    if (!context) {
        throw new InvalidDocument('Document content must contain "@context" property.');
    } else if (Array.isArray(context)) {
        if (context[0] !== DEFAULT_CONTEXT) {
            throw new InvalidDocument(`First "@context" value must be: "${DEFAULT_CONTEXT}". Found: "${context[0]}"`);
        }
    } else if (_.isString(context)) {
        if (context !== DEFAULT_CONTEXT) {
            throw new InvalidDocument(`Document with only one "@context" value must be none other than: "${DEFAULT_CONTEXT}". Found: "${context}"`);
        }
    } else {
        throw new InvalidDocument('Document "@context" value must be a string or an ordered set.');
    }

    if (!id) {
        throw new InvalidDocument('Document content must contain "id" property.');
    } else if (!isDidValid(id)) {
        throw new InvalidDocument(`Document "id" must be a valid DID. Found: "${id}"`);
    }
};
