import * as React from 'react'
interface IGraphProtocolContext{
    borg:any
}
export const GraphProtocolContext = React.createContext<IGraphProtocolContext>({
    borg:null
});
interface GraphProviderProps{
    children:React.ReactChild,
    borg:any
}
export const GraphProvider = ({ children, borg }:GraphProviderProps) => {
    return <GraphProtocolContext.Provider value={borg}> { children } </GraphProtocolContext.Provider>
}
