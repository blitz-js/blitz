export * from './useQuery'
export * from './ssrQuery'
export * from './rpc'

export {
  GetStaticProps,
  GetStaticPaths,
  GetServerSideProps,
  NextPage as BlitzPage,
  NextApiRequest as BlitzApiRequest,
  NextApiResponse as BlitzApiResponse,
} from 'next'

export {default as Head} from 'next/head'

export {default as Link} from 'next/link'

export {Router, useRouter, withRouter} from 'next/router'

export {
  default as Document,
  Html,
  Head as DocumentHead,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'

export {default as dynamic} from 'next/dynamic'
