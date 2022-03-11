import React, { useEffect, useState } from 'react';
import Photo from './Photo';
import type { PHOTO } from './Photo';

function Gallery() {
  const [photos, setPhotos] = useState<PHOTO[]>([]);
  useEffect(() => {
    setPhotos([{cid:'a'}, {cid:'b'}, {cid:'c'}])
  });


  return (
    <>
      <h1>Functionland Sample Gallery</h1>
    {
      photos.map((photo, index) => (
        <div key={index} className='photo'>
          <Photo photo={photo} />
        </div>
      ))
    }
    </>
  );

}

export default Gallery;
