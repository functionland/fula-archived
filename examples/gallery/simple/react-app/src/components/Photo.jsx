import React, { useState, useEffect } from 'react';


const Photo = ({ photo }) => {
  const [content, setContent] = useState(null)

  useEffect(() => {
    const fileToDataUrl = async () => {
      if (!photo) {
        console.log("no photo")
        return
      }
      try {
        let reader = new FileReader();
        reader.readAsDataURL(photo);
        reader.onloadend = () => setContent(reader.result)
      }catch (e) {
        console.log(e)
      }

    }
    if(photo){
      (async () => {
        await fileToDataUrl(photo);
      })()
    }
  }, [photo]);




  return <div className='photo'>
    <img width="100%" src={content} alt={photo.name}/>
  </div>

};

export default Photo;
