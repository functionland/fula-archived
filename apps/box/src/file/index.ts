import {FileProtocol as Protocol, SchemaProtocol as Schema} from "@functionland/file-protocol";

export const registerFile = (libp2pNode,ipfsNode) => {

    libp2pNode.handle(Protocol.PROTOCOL, Protocol.handler);

    Protocol.setMetaRetrievalMethod(async ({ id }) => {
        for await (const file of ipfsNode.cat(id)) {
            const { meta } = Schema.File.fromBinary(file);
            return meta;
        }
    });

    Protocol.setContentRetrievalMethod(async ({ id }) => {
        for await (const file of ipfsNode.cat(id)) {
            const { contentPath } = Schema.File.fromBinary(file);
            return ipfsNode.cat(contentPath);
        }
    });

    Protocol.incomingFiles.subscribe(async ({ getContent, meta, declareId }) => {
        const { cid: file } = await ipfsNode.add(
            getContent()
        );
        const { cid } = await ipfsNode.add(Schema.File.toBinary({ contentPath: file.toString(), meta }));
        declareId(cid.toString());
    });
}

export {Protocol, Schema}
