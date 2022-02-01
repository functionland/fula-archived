import * as grapgql from 'graphql';

export const readQuery = grapgql.parse(`
  query {
    read(input:{
      collection:"todo",
      filter:{}
    }){
      id
      text
      isComplete
    }
  } 
`);
export const createMutation = grapgql.parse(`
  mutation addTodo($values:JSON){
    create(input:{
      collection:"todo",
      values: $values
    }){
      id
      text
      isComplete
    }
  }
`);
export const updateMutation = grapgql.parse(`
  mutation updateTodo($values:JSON){
    create(input:{
      collection:"todo",
      values: $values
    }){
      id
      text
      isComplete
    }
  }
`);
export const deleteMutation = grapgql.parse(`
  mutation deleteTodo($values:JSON){
    create(input:{
      collection:"todo",
      ids: $values
    }){
      id
      text
      isComplete
    }
  }
`);