import React, { useEffect, useState } from 'react';
import Photo from './Photo';
import type { PHOTO } from './Photo';
import { Fula } from '@functionland/fula'


interface Props {
  fulaClient: Fula
}

const Gallery = ({ fulaClient }: Props): JSX.Element => {

  const [photos, setPhotos] = useState<PHOTO[]>([{cid:'a'}, {cid:'b'}, {cid:'c'}]);

  return (
    <>
      <h1>Functionland Sample Gallery</h1>
    {
      photos.map((photo, index) => (
        <div key={index} >
          <Photo photo={photo} fulaClient={fulaClient} />
        </div>
      ))
    }
    </>
  );

}

export default Gallery;
