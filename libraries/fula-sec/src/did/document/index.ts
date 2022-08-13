// @ts-ignore
import _ from 'lodash'; //{ _.omitBy, _.isArray, _.isUndefined }
import service from './service.js';
import publicKey from './publicKey.js';
import authentication from './authentication.js';
import { generateDocument, isEquivalentId, assertDocument } from './utils/index.js';

class Document {
    _content: { id: string; publicKey: any[]; authentication: any[]; service: any[]; updated: string; };

    constructor(content: any) {
        this._content = {
            publicKey: [],
            authentication: [],
            service: [],
            ...content,
        };
    }

    getContent() {
        return _.omitBy(this._content, (prop) => _.isUndefined(prop) || (_.isArray(prop) && prop.length === 0));
    }

    addPublicKey(props: { id: string; controller: string; }, options: { idPrefix: any; }) {
        // @ts-ignore
        const { idPrefix } = { ...options };

        props.id = publicKey.createId(this._content.id, props.id, { prefix: idPrefix });
        props.controller = props.controller || this._content.id;

        publicKey.assert(props, this._content.publicKey);

        this._content.publicKey.push(props);
        this._refreshUpdated();

        return props;
    }

    revokePublicKey(id: string) {
        const filter = this._content.publicKey.filter((key) => !isEquivalentId(key.id, id, publicKey.separator));

        if (this._content.publicKey.length === filter.length) {
            return;
        }

        this.removeAuthentication(id);

        this._content.publicKey = filter;
        this._refreshUpdated();
    }

    addAuthentication(auth: string) {
        const key = this._content.publicKey.find((pk) => isEquivalentId(pk.id, auth, publicKey.separator)) || {};

        authentication.assert(key.id, this._content.authentication);

        this._content.authentication.push(key.id);
        this._refreshUpdated();

        return key.id;
    }

    removeAuthentication(id: string) {
        const filter = this._content.authentication.filter((auth) => !isEquivalentId(id, authentication.parseId(auth), publicKey.separator));

        if (this._content.authentication.length === filter.length) {
            return;
        }

        this._content.authentication = filter;
        this._refreshUpdated();
    }

    addService(props: any, options: any) {
        // @ts-ignore
        const { idPrefix } = { ...options };

        props.id = service.createId(this._content.id, props.id, { prefix: idPrefix });

        service.assert(props, this._content.service);

        this._content.service.push(props);
        this._refreshUpdated();

        return props;
    }

    removeService(id: string) {
        const filter = this._content.service.filter((srvc) => !isEquivalentId(srvc.id, id, service.separator));

        if (this._content.service.length === filter.length) {
            return;
        }

        this._content.service = filter;
        this._refreshUpdated();
    }

    _refreshUpdated = () => {
        this._content.updated = new Date().toISOString();
    }
}

const createDocument = (did: string, content?: {
        '@context': string; id: any; created //{ _.omitBy, _.isArray, _.isUndefined }
            : string;
    } | undefined) => {
    if (!content) {
        content = generateDocument(did);
    }

    return new Document(content);
};

export { assertDocument };

export default createDocument;
