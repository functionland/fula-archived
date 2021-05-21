import { HandlerProps } from 'libp2p';
import * as Graph from './graph';
import * as File from './file';

export type ProtocolHandler = (props: HandlerProps) => void;

export {
  File as FileProtocol,
  Graph as GraphProtocol
};

export default {
  File,
  Graph
};
