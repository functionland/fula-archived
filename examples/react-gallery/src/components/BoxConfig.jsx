import React, { useState, useRef } from 'react';

export const BoxConfig = ({serverId, save})=>{

    const inputRef = useRef(null);
    const [_serverId, _setServerId] = useState(serverId)

    const onSet = (e) => {
        e.preventDefault();
        save(_serverId)
    }

    return  <div className='connect-container'>
        <input
            placeholder='Enter your server Id'
            value={_serverId}
            onChange={(e)=>_setServerId(e.target.value)}
            name='text'
            ref={inputRef}
            className='todo-input'
        />
        <button  onClick={onSet} className='todo-button'>
            Set
        </button>

    </div>
}






