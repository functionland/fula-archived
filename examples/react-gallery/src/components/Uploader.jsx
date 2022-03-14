import React, { useState, useRef } from 'react';

export const Uploader = ({fula})=>{

  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null)

  const handleSelectFile = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const upload = async (e) => {
    e.preventDefault();

    try{
      const cid = await fula.sendFile(selectedFile)
      const data = await fula.graphql(createMutation,{values:[{cid, _id:cid}]})
      const allData = await fula.graphql(readQuery)
      console.log(allData)
    }
    catch (e) {
      console.log(e.message)
    }

  }

  return  <div className='connect-container'>
    <input
      placeholder='browse file'
      type="file"
      onChange={handleSelectFile}
      name='file'
      ref={inputRef}
      className='todo-input'
    />
    <button  onClick={upload} className='todo-button'>
      Send
    </button>

  </div>
}



export const readQuery = `
  query {
    read(input:{
      collection:"gallery",
      filter:{}
    }){
      cid
    }
  } 
`


export const createMutation = `
  mutation addImage($values:JSON){
    create(input:{
      collection:"gallery",
      values: $values
    }){
      cid
    }
  }
`;
