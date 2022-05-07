import {FileProtocol as Protocol, SchemaProtocol as Schema} from "@functionland/file-protocol";


export const registerFile = async (libp2pNode, ipfsNode) => {

    libp2pNode.handle(Protocol.PROTOCOL, Protocol.handler);



    Protocol.setMetaRetrievalMethod(async ({id}) => {
        try{
            for await (const file of ipfsNode.cat(id)) {
                const {meta} = Schema.File.fromBinary(file);
                return meta;
            }
        }catch (e) {
            console.log(e)
        }

    });

    Protocol.setContentRetrievalMethod(async ({id}) => {
        try {
            for await (const file of ipfsNode.cat(id)) {
                const {contentPath} = Schema.File.fromBinary(file);
                return ipfsNode.cat(contentPath);
            }
        }catch (e) {
            console.log(e)
        }

    });

    Protocol.incomingFiles.subscribe(async ({getContent, meta, declareId}) => {
        try{
            const {cid: file} = await ipfsNode.add(
              getContent()
            );
            const {cid} = await ipfsNode.add(Schema.File.toBinary({contentPath: file.toString(), meta}));
            declareId(cid.toString());
        }catch (e) {
            console.log(e)
        }

    });
}

export {Protocol, Schema}
