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

const items = {
  nextConfigEnv: process.env.nextConfigEnv,
  nextConfigPublicEnv: process.env.nextConfigPublicEnv,
}

variables.forEach((variable) => {
  items[variable] = process.env[variable]
})

export default async (req, res) => {
  // Only for testing, don't do this...
  res.json(items)
}
