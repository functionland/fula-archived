import React, { useState } from 'react';
import TodoForm from './TodoForm';
import { AiFillCloseCircle } from "react-icons/ai";
import { AiFillEdit } from 'react-icons/ai';
export type TODO = {
  id: string,
  text: string,
  isComplete: boolean,
}
interface Props {
  todos: TODO[],
  completeTodo: (id: string) => void,
  removeTodo: (id: string) => void,
  updateTodo: (todo: TODO) => void
}
const Todo = ({ todos, completeTodo, removeTodo, updateTodo }: Props): JSX.Element => {
  const [edit, setEdit] = useState<TODO>({
    id: '',
    text: '',
    isComplete: false
  });


  const submitUpdate = (todo: TODO) => {
    updateTodo({
      ...todo
    });
    setEdit({
      id:'',
      text:'',
      isComplete:false
    });
  };

  if (edit.id) {
    return <TodoForm edit={edit} onSubmit={submitUpdate} />;
  }

  return <>
    {
      todos.map((todo, index) => (
        <div
          className={todo.isComplete ? 'todo-row complete' : 'todo-row'}
          key={index}
        >
          <div key={todo.id} onClick={() => completeTodo(todo.id)}>
            {todo.text}
          </div>
          <div className='icons'>
            <AiFillCloseCircle
              onClick={() => removeTodo(todo.id)}
              className='delete-icon'
            />
            <AiFillEdit
              onClick={() => setEdit({ ...todo })}
              className='edit-icon'
            />
          </div>
        </div>
      ))
    }
  </>
};

export default Todo;