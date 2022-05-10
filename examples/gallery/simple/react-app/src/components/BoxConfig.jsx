import React, {useState, useRef} from 'react';

export const BoxConfig = ({serverId, onSet}) => {

  const inputRef = useRef(null);
  const [_serverId, _setServerId] = useState(serverId)

  const _onSet = (e) => {
    e.preventDefault();
    onSet(_serverId.split(','))
  }

  return <>
    <div className="container">
      <div className="app-config" style={{
          display:"flex",
          flexDirection: "column"
      }}>
          <div style={{
              display:"flex"
          }}>
              <input
                type="text"
                placeholder='Enter your server Ids comma seperated'
                value={_serverId}
                onChange={(e) => _setServerId(e.target.value)}
                name='text'
                ref={inputRef}
              />
              <div>
                  <button onClick={_onSet}>
                      Set
                  </button>
              </div>
          </div>

      </div>

      </div>



  </>
}
