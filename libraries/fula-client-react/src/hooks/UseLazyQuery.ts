
import {useState,useContext, useCallback} from 'react'
import { DocumentNode, GraphQLError } from 'graphql';
import {FulaContext} from '../providers/FulaProvider'
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
    variables?: TVariables | undefined;
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
export declare type QuerySubscriptionTuple<TData> = [data: TData|undefined, loading: boolean, error?: GraphError]

export function useLazyQuery<TData = any, TVariables = OperationVariables>(query: DocumentNode | TypedDocumentNode<TData, TVariables>): QueryTuple<TData, TVariables> {
    const [data,setData]=useState<TData>();
    const [error,setError]=useState<GraphError>();
    const [loading,setLoading]=useState<boolean>(false);
    const fula = useContext(FulaContext);
    const request =useCallback((options?: QueryLazyOptions<TVariables>): void => {
        try {
            if(fula && query.loc?.source?.body){
                setLoading(true);
                // @ts-ignore
                fula.graphql(query.loc?.source?.body,options?.variables,query?.definitions?.[0]?.name?.value).then(query=>{
                    console.log("request:",data);
                    setData({
                        ...((query as any)?.data||{})
                    });
                }).catch((error: GraphError)=>{
                    console.log("request error:",error);
                    setError(error);
                }).finally(()=>{
                    setLoading(false);
                });
            }
            console.log("request",query);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    },[fula]);
    return [request,{data,error,loading}]
}