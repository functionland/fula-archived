import React, { useEffect, useState } from 'react';
import TodoForm from './TodoForm';
import Todo, { TODO } from './Todo';
import { useLazyQuery } from '../hooks/UseLazyQuery';
import { readQuery, createMutation, updateMutation, deleteMutation } from '../queries/ToDo'

function TodoList() {
  const [todos, setTodos] = useState<TODO[]>([]);
  const [readTodos, readTodoStatus] = useLazyQuery(readQuery);
  const [createTodo, createTodoStatus] = useLazyQuery(createMutation);
  const [updateTodoMutation, updateTodoStatus] = useLazyQuery(updateMutation);
  const [deleteTodoMutation, deleteTodoStatus] = useLazyQuery(deleteMutation);

  useEffect(() => {
    readTodos();
  }, []);

  useEffect(() => {
    console.log("readTodoStatus", readTodoStatus);
    if (readTodoStatus.data?.read)
      setTodos(readTodoStatus.data?.read);
  }, [readTodoStatus]);

  useEffect(() => {
    console.log("createTodoStatus", createTodoStatus);
  }, [createTodoStatus]);

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