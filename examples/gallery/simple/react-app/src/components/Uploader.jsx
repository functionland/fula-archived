import React, { useState, useRef } from 'react';

export const Uploader = ({onUpload})=>{

  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null)

  const handleSelectFile = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const _onUpload = async (e) => {
    e.preventDefault();
    if(selectedFile)
      onUpload(selectedFile)
  }

  return  <div style={{margin:"10px",display:"flex", justifyContent:"center"}}>
    <input
      placeholder='browse file'
      type="file"
      onChange={handleSelectFile}
      name='file'
      ref={inputRef}

    />
    <button  onClick={_onUpload} >
      Upload
    </button>
  </div>
}




