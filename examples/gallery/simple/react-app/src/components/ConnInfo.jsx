import React from 'react';
import {Status} from '@functionland/fula'
import {IoCloudOfflineSharp, IoCloudSharp, IoBanSharp, IoSettingsSharp} from 'react-icons/io5'

export const ConnInfo = ({status, onSetting, info}) => {

  const _onSetting = async (e) => {
    e.preventDefault();
    onSetting()
  }

  return (
    <div className='conn-info'>
      {(() => {
        switch (status) {
          case Status.Online:
            return <IoCloudSharp size={32}/>
          case Status.Offline:
            return <IoCloudOfflineSharp size={32}/>
          default:
            return <IoBanSharp size={32} />
        }
      })()}
      <button style={{background: 'transparent'}} onClick={_onSetting}>
        <IoSettingsSharp size={30}/></button>
      <span>{info}</span>
    </div>
  )
}
