import {FileProtocol as Protocol, SchemaProtocol as Schema} from "@functionland/file-protocol";
import {getLogger} from "../logger";

const log = getLogger()

export const registerFile = async (libp2pNode, ipfsNode) => {
    log.trace('Registering File Protocol')
    await libp2pNode.handle(Protocol.PROTOCOL, Protocol.handler);
    Protocol.setMetaRetrievalMethod(async ({id}) => {
        log.trace('Retrieve meta for %s', id)
        try{
            for await (const file of ipfsNode.cat(id)) {
                const {meta} = Schema.File.fromBinary(file);
                return meta;
            }
        }catch (e) {
            log.error('Failed Retrieving meta for %s, reason: %O', id, e)
        }
    });
    Protocol.setContentRetrievalMethod(async ({id}) => {
        log.trace('Retrieve file for %s', id)
        try {
            for await (const file of ipfsNode.cat(id)) {
                const {contentPath} = Schema.File.fromBinary(file);
                return ipfsNode.cat(contentPath);
            }
        }catch (e) {
            log.error('Failed Retrieving file content for %s, reason: %O', id, e)
        }
    });
    Protocol.incomingFiles.subscribe(async ({getContent, meta, declareId}) => {
        log.trace('Store file %o', meta)
        try{
            const {cid: file} = await ipfsNode.add(
              getContent()
            );
            const {cid} = await ipfsNode.add(Schema.File.toBinary({contentPath: file.toString(), meta}));
            declareId(cid.toString());
        }catch (e) {
            log.error('Failed Retrieving file content of %O, reason: %O', meta,e)
        }
    });
}

export {Protocol, Schema}
