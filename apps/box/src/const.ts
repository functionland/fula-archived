import config from "config";

export const IPFS_PATH = './data/ipfs'
export const LIBP2P_PATH = './data'
export const ORBITDB_PATH = './data/orbit'
export const IPFS_HTTP = config.get("ipfs.http")
export const FULA_NODES = config.get("nodes")
