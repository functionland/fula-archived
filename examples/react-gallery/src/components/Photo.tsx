import React, { useState, useEffect } from 'react';
import { Fula } from '@functionland/fula'


export type PHOTO = {
  cid: string,
}

interface Props {
  photo: PHOTO,
  fulaClient: Fula
}

const Photo = ({ photo, fulaClient }: Props): JSX.Element => {

  const [content, setContent] = useState("")
  const [output, setOutput] = useState("");


  useEffect(() => {
      (async () => {
          receiveFile();
      })()
  }, []);


  const receiveFile = async () => {
      if (!fulaClient) {
          console.log("fula not connected")
          return
      }
      try {

          const data = await fulaClient.receiveFile(photo.cid);
          let reader = new FileReader();
          reader.readAsDataURL(data);
          // @ts-ignore
          reader.onloadend = (e) => setContent(reader.result)
      }catch (e) {
          console.log(e)
      }

  }

  return <div className='photo'>
      <img width="100%" src={content} />
  </div>

};

export default Photo;
