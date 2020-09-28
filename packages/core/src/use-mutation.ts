import {
  useMutation as useReactQueryMutation,
  MutationResult,
  MutationConfig,
  MutateConfig,
} from "react-query"

/*
 * We have to override react-query's MutationFunction and MutationResultPair
 * types so because we have throwOnError:true by default. And by the RQ types
 * have the mutate function result typed as TResult|undefined which isn't typed
 * properly with throwOnError.
 *
 * So this fixes that.
 */
export declare type MutateFunction<
  TResult,
  TError = unknown,
  TVariables = unknown,
  TSnapshot = unknown
> = (
  variables?: TVariables,
  config?: MutateConfig<TResult, TError, TVariables, TSnapshot>,
) => Promise<TResult>

export declare type MutationResultPair<TResult, TError, TVariables, TSnapshot> = [
  MutateFunction<TResult, TError, TVariables, TSnapshot>,
  MutationResult<TResult, TError>,
]

export declare type MutationFunction<TResult, TVariables = unknown> = (
  variables: TVariables,
  ctx?: any,
) => Promise<TResult>

export function useMutation<TResult, TError = unknown, TVariables = undefined, TSnapshot = unknown>(
  mutationResolver: MutationFunction<TResult, TVariables>,
  config?: MutationConfig<TResult, TError, TVariables, TSnapshot>,
) {
  return useReactQueryMutation(mutationResolver, {
    throwOnError: true,
    ...config,
  }) as MutationResultPair<TResult, TError, TVariables, TSnapshot>
}
