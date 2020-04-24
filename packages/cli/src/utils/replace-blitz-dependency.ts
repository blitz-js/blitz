export const replaceBlitzDependency = (depends: Record<string, string>, cliVersion: string) => {
  if (depends.blitz) {
    depends.blitz = cliVersion.includes('canary') ? 'canary' : 'latest'
  }

  return depends
}
