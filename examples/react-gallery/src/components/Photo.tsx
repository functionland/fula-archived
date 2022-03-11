import React, { useState } from 'react';

export type PHOTO = {
  cid: string,
}

interface Props {
  photo: PHOTO
}

const Photo = ({ photo, }: Props): JSX.Element => {
  return <>
      {photo.cid}
  </>

};

export default Photo;
