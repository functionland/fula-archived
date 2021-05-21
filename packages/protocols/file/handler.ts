import pipe from 'it-pipe';
import { ProtocolHandler } from '..';

export const handleFile: ProtocolHandler = async ({stream}) => {
  await pipe(
    stream,
    async function (source) {
      for await (const message of source) {
        console.log(String(message))
      }
    }
  )
  await pipe([], stream)
}
