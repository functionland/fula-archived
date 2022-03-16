import React, { useState, useEffect } from 'react';


const Photo = ({ photo }) => {
  const [content, setContent] = useState(null)

  useEffect(() => {
    if(photo){
      (async () => {
        await fileToDataUrl(photo);
      })()
    }
  }, [photo]);


  const fileToDataUrl = async () => {
    if (!photo) {
      console.log("no photo")
      return
    }
    try {
      let reader = new FileReader();
      reader.readAsDataURL(photo);
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
