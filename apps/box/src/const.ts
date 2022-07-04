import config from "config";

export const IPFS_PATH = './data/ipfs'
export const REPO_PATH = './data'
export const ORBITDB_PATH = './data/orbit'

export const IPFS_HTTP = config.get("ipfs.http")
export const FULA_NODES = config.get("nodes")
export const IPFS_CLUSTER_PROXY = config.get("cluster.proxy")
export const LISTENING = config.get("network.listen")
export const PKEY_PATH = config.get("network.key_path")
export const ENV = (()=>process.env.NODE_ENV)()
