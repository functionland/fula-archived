// A wrapper around @libp2p/logger. For logging purposes.
import { logger as libp2pLogger, enable } from '@libp2p/logger'
import debug from "debug";

let _log: undefined|Logger = undefined

interface Logger {
  info
  error
  trace
  enabled
}

const logger = (name)=>{
  const lpLogger = libp2pLogger(`${name}`)
  const info = debug(`${name}:info`)
  info.log = console.log.bind(console)
  if(process.env.DEBUG===undefined){
    enable(`${name}:*,-${name}:trace`)
  }
  return Object.assign(lpLogger, {info})
}


export const getLogger = () => {
  if(_log){
    return _log
  }
  _log = logger('box')
  return _log
}


