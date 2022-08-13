export class BaseError extends Error {
    constructor(message: any, code: any, props?: any) {
        super(message);

        Object.assign(this, {
            ...props,
            code,
            name: this.constructor.name,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);

            return;
        }

        this.stack = (new Error(message)).stack;
    }
}

// Authentication Based -------------------------------------

export class DuplicateAuthentication extends BaseError {
    constructor(id: any) {
        super(`Authentication with same ${id} already exists.`, 'DUPLICATE_AUTHENTICATION');
    }
}

export class InvalidAuthentication extends BaseError {
    constructor(message?: any) {
        message = message || 'Invalid authentication.';

        super(message, 'INVALID_AUTHENTICATION');
    }
}

// ----------------------------------------------------------

// Public Key Based -----------------------------------------

export class DuplicatePublicKey extends BaseError {
    constructor(id: any) {
        super(`PublicKey with same ${id} already exists.`, 'DUPLICATE_PUBLICKEY');
    }
}

export class InvalidPublicKey extends BaseError {
    constructor(message: any) {
        message = message || 'Invalid public key.';

        super(message, 'INVALID_PUBLICKEY');
    }
}

// ----------------------------------------------------------

// Service Endpoint Based -----------------------------------

export class DuplicateService extends BaseError {
    constructor(id: any) {
        super(`Service with same ${id} already exists.`, 'DUPLICATE_SERVICE');
    }
}

export class InvalidService extends BaseError {
    constructor(message:any) {
        message = message || 'Invalid service.';

        super(message, 'INVALID_SERVICE');
    }
}

// ----------------------------------------------------------

// IPFS/IPNS Based ------------------------------------------

export class InvalidDid extends BaseError {
    constructor(did: any, message?: any, props?: any) {
        message = message || `Invalid DID: ${did}`;

        super(message, 'INVALID_DID', props);
    }
}

export class IllegalCreate extends BaseError {
    constructor(message?: any) {
        message = message || 'Document already exists.';

        super(message, 'ILLEGAL_CREATE');
    }
}

export class UnavailableIpfs extends BaseError {
    constructor(message?: any) {
        message = message || 'IPFS node is unavailable.';

        super(message, 'IPFS_UNAVAILABLE');
    }
}

// ----------------------------------------------------------

// Document Based -----------------------------------

export class InvalidDocument extends BaseError {
    constructor(message: any) {
        message = message || 'Document is invalid.';

        super(message, 'INVALID_DOCUMENT');
    }
}

export class InvalidIdPrefix extends BaseError {
    constructor() {
        super('Id prefix should be a string without reserved characters: ["#", ";"]', 'INVALID_ID_PREFIX');
    }
}

// ----------------------------------------------------------
