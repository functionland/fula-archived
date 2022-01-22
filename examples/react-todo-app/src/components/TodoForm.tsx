import React, { useState, useEffect, useRef } from 'react';
import { TODO } from "./Todo"
interface Props {
  edit?: TODO;
  onSubmit?: (todo:TODO) => void;
}
function TodoForm(props: Props) {
  const [input, setInput] = useState<string>(props.edit ? props.edit.text : '');

  const inputRef = useRef<any>(null);

  useEffect(() => {
    inputRef?.current?.focus();
  });

  const handleChange = (e: any) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    props?.onSubmit?.({
      id: `${Math.floor(Math.random() * 10000)}`,
      text: input,
      isComplete:props.edit?props.edit.isComplete:false
    });
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className='todo-form'>
      {props.edit ? (
        <>
          <input
            placeholder='Update your item'
            value={input}
            onChange={handleChange}
            name='text'
            ref={inputRef}
            className='todo-input edit'
          />
          <button onClick={handleSubmit} className='todo-button edit'>
            Update
          </button>
        </>
      ) : (
        <>
          <input
            placeholder='Add new todo here!'
            value={input}
            onChange={handleChange}
            name='text'
            className='todo-input'
            ref={inputRef}
          />
          <button onClick={handleSubmit} className='todo-button'>
            Add
          </button>
        </>
      )}
    </form>
  );
}

export default TodoForm;