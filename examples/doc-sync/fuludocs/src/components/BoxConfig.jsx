import React, { useState, useRef } from 'react';

export const BoxConfig = ({serverId, onSet})=>{

    const inputRef = useRef(null);
    const [_serverId, _setServerId] = useState(serverId)

    const _onSet = (e) => {
        e.preventDefault();
        onSet(_serverId)
    }

    return  <div className="container">
        <div className="app-config">
            <input
              placeholder='Enter your server Id'
              value={_serverId}
              onChange={(e)=>_setServerId(e.target.value)}
              name='text'
              ref={inputRef}
            />
            <button  onClick={_onSet} >
                Set
            </button>
        </div>
    </div>
}






