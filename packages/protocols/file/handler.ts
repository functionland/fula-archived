import pipe from 'it-pipe';
import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { ProtocolHandler, FileProtocol } from '..';
import { fileToBlocks } from './utils';

export const handleFile: ProtocolHandler = async ({stream}) => {
  let a = 0;
  await pipe(
    stream,
    async function (source) {
      for await (const message of source) {
        a++;
        console.log(a)
        console.log(String(message))
      }
    }
  )
  await pipe([], stream)
}

export async function sendFile({to, node, file}: {to: PeerId, node: Libp2p, file: File}) {
    const { stream } = await node.dialProtocol(to, FileProtocol.PROTOCOL);
    await pipe(
      () => fileToBlocks(file),
      stream
    );
    console.log('sent')
}
