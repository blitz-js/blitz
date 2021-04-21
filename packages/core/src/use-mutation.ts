import {
  MutateOptions,
  useMutation as useReactQueryMutation,
  UseMutationOptions,
  UseMutationResult,
} from "react-query"
import {sanitizeMutation} from "./utils/react-query-utils"

/*
 * We have to override react-query's MutationFunction and MutationResultPair
 * types so because we have throwOnError:true by default. And by the RQ types
 * have the mutate function result typed as TData|undefined which isn't typed
 * properly with throwOnError.
 *
 * So this fixes that.
 */
export declare type MutateFunction<
  TData,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown
> = (
  variables?: TVariables,
  config?: MutateOptions<TData, TError, TVariables, TContext>,
) => Promise<TData>

export declare type MutationResultPair<TData, TError, TVariables, TContext> = [
  MutateFunction<TData, TError, TVariables, TContext>,
  Omit<UseMutationResult<TData, TError>, "mutate" | "mutateAsync">,
]

export declare type MutationFunction<TData, TVariables = unknown> = (
  variables: TVariables,
  ctx?: any,
) => Promise<TData>

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  mutationResolver: MutationFunction<TData, TVariables>,
  config?: UseMutationOptions<TData, TError, TVariables, TContext>,
): MutationResultPair<TData, TError, TVariables, TContext> {
  const enhancedResolverRpcClient = sanitizeMutation(mutationResolver)

  const {mutate, mutateAsync, ...rest} = useReactQueryMutation<TData, TError, TVariables, TContext>(
    (variables) => enhancedResolverRpcClient(variables, {fromQueryHook: true}),
    {
      throwOnError: true,
      ...config,
    } as any,
  )

  return [mutateAsync, rest] as MutationResultPair<TData, TError, TVariables, TContext>
}
