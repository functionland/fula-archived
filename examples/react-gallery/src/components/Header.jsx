import React from 'react';
import {Status} from '@functionland/fula'

export const Header = ({status})=>{
    return  (
        <div className='app-header'>
            {(()=>{
                switch (status){
                    case Status.Online:
                        return <h1>Connected</h1>
                    case Status.Offline:
                        return <h1>Offline</h1>
                    case Status.Connecting:
                        return <div className='lds-ellipsis'><div/><div/><div/><div></div></div>
                    default:
                        return <h1>{status}</h1>
                }
            })()}
        </div>
    )
}
