import glob from 'fast-glob'

export const getPages = async (path: string) => {
  const entries = await glob('app/**/*.tsx', {cwd: path})

  const routes = entries
    .filter((route) => route.includes('pages'))
    .filter((route) => !['app/pages/_app.tsx', 'app/pages/_document.tsx'].includes(route))
  const links = routes.map((route) =>
    route
      .split('pages')[1]
      .replace('.tsx', '')
      .replace(/index$/, ''),
  )

  return routes.map((route, i) => ({route: route, link: links[i]}))
}
