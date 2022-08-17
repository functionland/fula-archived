import { SEPARATORS, isEquivalentId, createId } from './utils/index';
import { DuplicateService, InvalidService } from '../utils/errors';

const SEPARATOR = SEPARATORS.SERVICE;
const REQUIRED = ['type', 'serviceEndpoint'];

const assertId = (service: { id: string; }, services: any[]) => {
    const collision = services.find((key: { id: string; }) => isEquivalentId(key.id, service.id, SEPARATOR));

    if (collision) {
        throw new DuplicateService(service.id);
    }
};

const assertRequired = (publicKey: { [x: string]: any; }) => {
    REQUIRED.forEach((key) => {
        if (!publicKey[key]) {
            throw new InvalidService(`Service requires \`${key}\` to be defined.`);
        }
    });
};

const assert = (service: any, services: any) => {
    assertId(service, services);
    assertRequired(service);
};

export default {
    assert,
    separator: SEPARATOR,
    createId: (did: string, fragment: Promise<string>, options: { prefix?: "" | undefined; }) => createId(did, fragment, SEPARATOR, options),
};
