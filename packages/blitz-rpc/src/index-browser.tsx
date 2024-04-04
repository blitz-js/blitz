import "./global"
export * from "./client/index"
export {
  BlitzProvider,
  BlitzRpcPlugin,
  QueryClient,
  dehydrate,
  getInfiniteQueryKey,
  getQueryClient,
  getQueryData,
  getQueryKey,
  invalidateQuery,
  setQueryData,
  useInfiniteQuery,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "./query/react-query"
export type {
  DefaultOptions,
  HydrateOptions,
  MutateFunction,
  MutationFunction,
  MutationResultPair,
  RestPaginatedResult,
  RestQueryResult,
} from "./query/react-query"
export * from "./query/utils"

import {reactQueryClientReExports} from "./query/react-query"
const {QueryClientProvider, Hydrate, useQueryErrorResetBoundary} = reactQueryClientReExports
export {QueryClientProvider, Hydrate, useQueryErrorResetBoundary}
