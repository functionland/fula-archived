import React from 'react';
import Photo from './Photo';


export const Gallery = ({ photos }) => {
  return (
    <>
      {
        photos.length > 0 && photos.map((photo, index) => (
          <div key={index} >
            <Photo photo={photo} />
          </div>
        ))
      }
      {
        photos.length === 0 && <div className="container">
            <h1>no photo</h1>
          </div>
      }
    </>
  );

}
