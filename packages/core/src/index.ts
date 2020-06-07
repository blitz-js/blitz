export * from './use-query'
export * from './use-paginated-query'
export * from './use-params'
export * from './use-router-query'
export * from './use-infinite-query'
export * from './ssr-query'
export * from './rpc'

export {
  GetStaticProps,
  GetStaticPaths,
  GetServerSideProps,
  InferGetStaticPropsType,
  InferGetServerSidePropsType,
  NextPage as BlitzPage,
  NextApiRequest as BlitzApiRequest,
  NextApiResponse as BlitzApiResponse,
} from 'next'

export {AppProps} from 'next/app'

export {default as Head} from 'next/head'

export {default as Link} from 'next/link'

export {Router, useRouter, withRouter} from 'next/router'

export {
  default as Document,
  Html,
  Head as DocumentHead,
  Main,
  NextScript as BlitzScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document'

export {default as dynamic} from 'next/dynamic'

export {default as Error} from 'next/error'
