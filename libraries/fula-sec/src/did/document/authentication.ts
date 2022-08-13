import _ from 'lodash'; // { _.isString, _.isPlainObject }
import { DuplicateAuthentication, InvalidAuthentication } from '../utils/errors.js';

const parseId = (authentication: { id: any; }) =>
    _.isPlainObject(authentication) ? authentication.id : authentication;

const assertId = (id: any, authentications: any[]) => {
    const collision = authentications.some((auth: any) => parseId(auth) === id);

    if (collision) {
        throw new DuplicateAuthentication(id);
    }
};

const assertType = (authentication: any) => {
    if (!_.isString(authentication)) {
        throw new InvalidAuthentication();
    }
};

const assert = (authentication: any, authentications: any) => {
    assertType(authentication);
    assertId(parseId(authentication), authentications);
};

export default {
    assert,
    parseId,
};
