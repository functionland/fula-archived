import {DocumentNode} from "graphql";
import {useContext, useEffect, useState} from "react";
import {FulaContext} from "../providers/FulaProvider";
import {
    GraphError,
    OperationVariables,
    QueryLazyOptions,
    QuerySubscriptionTuple,
    TypedDocumentNode
} from "./UseLazyQuery";

export function useSubscription<TData = any, TVariables = OperationVariables>(query: DocumentNode | TypedDocumentNode<TData, TVariables>, options?: QueryLazyOptions<TVariables>): QuerySubscriptionTuple<TData> {
    const [data,setData]=useState<TData>();
    const [error,setError]=useState<GraphError>();
    const [loading,setLoading]=useState<boolean>(false);
    const fula = useContext(FulaContext);
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                if (fula && query.loc?.source?.body) {
                    //@ts-ignore
                    const res = fula.graphqlSubscribe(query.loc?.source?.body, options?.variables, query?.definitions?.[0]?.name?.value)
                    for await (const partialRes of res) {
                        if (!isMounted)
                            break
                        setLoading(true)
                        setData({
                            ...(partialRes as any)?.data || {}
                        })
                        setLoading(false)
                    }
                }
            }
            catch (e) {
                setError(e)
            }
        })()

        return () => {
            isMounted = false
        }
    }, [fula])

    return [data,loading,error]
}