import React from 'react';
import { Status } from '@functionland/fula';
import {
  IoCloudOfflineSharp,
  IoCloudSharp,
  IoBanSharp,
  IoSettingsSharp
} from 'react-icons/io5';

export const Identity = ({ status, onSetting, info }) => {
  const _onSetting = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="identityContainer">
      <button  onClick={_onSetting}>
        New Identity
      </button>
      <button  onClick={_onSetting}>
        Import Identity
      </button>
     
    </div>
  );
};
