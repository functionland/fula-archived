import React, { createContext } from 'react'
import { Fula } from '@functionland/fula'

export const FulaContext = createContext<Fula | undefined>(undefined);
interface FulaProviderProps {
    children: React.ReactChild | undefined | null,
    fula: Fula | undefined
}
export const FulaProvider = ({ children, fula }: FulaProviderProps) => {
    return <FulaContext.Provider value={fula}> {children} </FulaContext.Provider>
}
