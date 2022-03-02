import React, { createContext } from 'react'
import { Borg } from '@functionland/fula'

export const BorgContext = createContext<Borg | undefined>(undefined);
interface BorgProviderProps {
    children: React.ReactChild | undefined | null,
    fula: Borg | undefined
}
export const BorgProvider = ({ children, fula }: BorgProviderProps) => {
    return <BorgContext.Provider value={fula}> {children} </BorgContext.Provider>
}
