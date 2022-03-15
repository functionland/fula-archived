import React from 'react';
import Photo from './Photo';


export const Gallery = ({ photos }) => {
  return (
    <>
      {
        photos.map((photo, index) => (
          <div key={index} >
            <Photo photo={photo} />
          </div>
        ))
      }
    </>
  );

}
