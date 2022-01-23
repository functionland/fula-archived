import React, { useState } from 'react';
import * as grapgql from 'graphql'
import TodoForm from './TodoForm';
import Todo, { TODO } from './Todo';
import { useLazyQuery } from '../hooks/UseLazyQuery';
const query=grapgql.parse(`
  query{
    read(input:{
      collection:todo
    }){
      id
      text
      isComplete
    }
  } 
`)
function TodoList() {
  const [todos, setTodos] = useState<TODO[]>([]);
const [loadTodos,{data,loading,error}]=useLazyQuery(query);
  const addTodo = (todo: TODO) => {
    if (!todo.text || /^\s*$/.test(todo.text)) {
      return;
    }

    const newTodos = [todo, ...todos];

    setTodos(newTodos);
    console.log(...todos);
    loadTodos();
  };

  const updateTodo = (newValue: TODO) => {
    if (!newValue.text || /^\s*$/.test(newValue.text)) {
      return;
    }

    setTodos(prev => prev.map(item => (item.id === newValue.id ? newValue : item)));
  };

  const removeTodo = (id: string) => {
    const removedArr = [...todos].filter(todo => todo.id !== id);

    setTodos(removedArr);
  };

  const completeTodo = (id: string) => {
    let updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        todo.isComplete = !todo.isComplete;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  return (
    <>
      <h1>Functionland Todo App</h1>
      <h4>Exprience graph protocol on the BOX!</h4>
      <TodoForm onSubmit={addTodo} />
      <Todo
        todos={todos}
        completeTodo={completeTodo}
        removeTodo={removeTodo}
        updateTodo={updateTodo}
      />
    </>
  );
}

export default TodoList;