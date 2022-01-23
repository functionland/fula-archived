
import React, {useState} from 'react'
import { DocumentNode, GraphQLError } from 'graphql';
export declare type OperationVariables = Record<string, any>;
export interface TypedDocumentNode<Result = {
    [key: string]: any;
}, Variables = {
    [key: string]: any;
}> extends DocumentNode {
    __resultType?: Result;
    __variablesType?: Variables;
}
export interface QueryLazyOptions<TVariables> {
    variables?: TVariables;
}
export interface GraphError {
    graphQLErrors: ReadonlyArray<GraphQLError>;
    clientErrors: ReadonlyArray<Error>;
    networkError: Error;
}
export interface QueryResult<TData = any> {
    data: TData | undefined;
    error?: GraphError;
    loading: boolean;
}
export declare type LazyQueryResult<TData> = QueryResult<TData>;
export declare type QueryTuple<TData, TVariables> = [
    (options?: QueryLazyOptions<TVariables>) => void,
    LazyQueryResult<TData>
];
export function useLazyQuery<TData = any, TVariables = OperationVariables>(query: DocumentNode | TypedDocumentNode<TData, TVariables>): QueryTuple<TData, TVariables> {
    const [data,setData]=useState<TData>();
    const [error,setError]=useState<GraphError>();
    const [loading,setLoading]=useState<boolean>(false);

    const request = (options?: QueryLazyOptions<TVariables>): void => {
        try {
            setLoading(true);
            console.log("request",query);
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(true);
        }
    }
    return [request,{data,error,loading}]
}