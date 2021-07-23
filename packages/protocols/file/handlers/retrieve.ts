import { Chunk } from '../schema';
import { Response } from '.';

type Retrieve = ({ Id, skip, limit }: Chunk) => Response;

const retrieveNotSupported: Retrieve = () => {
  throw new Error('This node does not support file retrieval');
};

export let retrieve = retrieveNotSupported;

export function setRetrievalMethod(method: Retrieve) {
  retrieve = method;
}
