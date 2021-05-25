import pipe from 'it-pipe';
import { ProtocolHandler } from '..';

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
