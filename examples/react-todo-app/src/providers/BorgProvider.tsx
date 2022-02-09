import * as React from 'react'
import { Borg } from '@functionland/borg'

export const BorgContext = React.createContext<Borg | undefined>(undefined);
interface BorgProviderProps {
    children: React.ReactChild|undefined|null,
    borg: Borg | undefined
}
export const BorgProvider = ({ children, borg }: BorgProviderProps) => {
    return <BorgContext.Provider value={borg}> {children} </BorgContext.Provider>
}
