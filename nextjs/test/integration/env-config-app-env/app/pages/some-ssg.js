const variables = [
  'PROCESS_ENV_KEY',
  'ENV_FILE_KEY',
  'ENV_FILE_EMPTY_FIRST',
  'PRODUCTION_ENV_FILE_KEY',
  'LOCAL_PRODUCTION_ENV_FILE_KEY',
  'ENV_FILE_DEVELOPMENT_OVERRIDE_TEST',
  'ENV_FILE_PRODUCTION_OVERRIDEOVERRIDE_TEST',
  'ENV_FILE_PRODUCTION_LOCAL_OVERRIDEOVERRIDE_TEST',
]

export async function getStaticProps() {
  const items = {}

  variables.forEach((variable) => {
    if (typeof process.env[variable] !== 'undefined') {
      items[variable] = process.env[variable]
    }
  })

  return {
    // Do not pass any sensitive values here as they will
    // be made PUBLICLY available in `pageProps`
    props: { env: items },
    revalidate: 1,
  }
}

export default ({ env }) => (
  <>
    <p>{JSON.stringify(env)}</p>
    <div id="nextConfigEnv">{process.env.nextConfigEnv}</div>
    <div id="nextConfigPublicEnv">{process.env.nextConfigPublicEnv}</div>
  </>
)
