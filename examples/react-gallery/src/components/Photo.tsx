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

  const [fileId, setFileId] = useState("QmYJt7141ZG2Kut37W2ZHYcyjYTJ36aX22KYu7einNevPD")
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
          const data = await fulaClient.receiveFile(fileId);
          console.log(data)
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
