import React, { useEffect, useState } from 'react';
import TodoForm from './TodoForm';
import Todo, { TODO } from './Todo';
import {useLazyQuery, useSubscription} from '@functionland/fula-client-react';
import { readQuery, createMutation, updateMutation, deleteMutation } from '../queries/ToDo'

function TodoList() {
  const [todos, setTodos] = useState<TODO[]>([]);
  const [createTodo, { data: createData }] = useLazyQuery(createMutation);
  const [updateTodoMutation, { data: updateData }] = useLazyQuery(updateMutation);
  const [deleteTodoMutation, { data: deleteData }] = useLazyQuery(deleteMutation);

  const [readData, loading, error] = useSubscription(readQuery)

  useEffect(() => {
    console.log("readTodoStatus", readData);
    if (readData?.read)
      setTodos(readData?.read);
  }, [readData]);

  useEffect(() => {
    console.log("createTodoStatus", createData);
  }, [createData]);

  const addTodo = (todo: TODO) => {
    if (!todo.text || /^\s*$/.test(todo.text)) {
      return;
    }

    const newTodos = [todo, ...todos];

    setTodos(newTodos);
    console.log(...todos);
    createTodo({
      variables: {
        values: [{ ...todo }]
      }
    });

  };

  const updateTodo = (newValue: TODO) => {
    if (!newValue.text || /^\s*$/.test(newValue.text)) {
      return;
    }
    updateTodoMutation({
      variables: {
        values: [newValue]
      }
    });
    setTodos(prev => prev.map(item => (item.id === newValue.id ? newValue : item)));
  };

  const removeTodo = (id: string) => {
    const removedArr = [...todos].filter(todo => todo.id !== id);
    deleteTodoMutation({
      variables: {
        values: [id]
      }
    })
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
      <h4>Experience graph protocol on the BOX!</h4>
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
