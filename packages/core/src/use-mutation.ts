import {useMutation as useReactQueryMutation, MutationConfig} from "react-query"
import {sanitize} from "./utils/react-query-utils"
import {MutationFunction, MutationResultPair} from "./types"

/*
 * We have to override react-query's MutationFunction and MutationResultPair
 * types so because we have throwOnError:true by default. And by the RQ types
 * have the mutate function result typed as TResult|undefined which isn't typed
 * properly with throwOnError.
 *
 * So this fixes that.
 */

export function useMutation<TResult, TError = unknown, TVariables = undefined, TSnapshot = unknown>(
  mutationResolver: MutationFunction<TResult, TVariables>,
  config?: MutationConfig<TResult, TError, TVariables, TSnapshot>,
) {
  const enhancedResolverRpcClient = sanitize(mutationResolver)

  return useReactQueryMutation(
    (variables: TVariables) => enhancedResolverRpcClient(variables, {fromQueryHook: true}),
    {
      throwOnError: true,
      ...config,
    },
  ) as MutationResultPair<TResult, TError, TVariables, TSnapshot>
}
