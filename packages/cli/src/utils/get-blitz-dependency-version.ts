export const getBlitzDependencyVersion = (cliVersion: string) => {
  if (cliVersion.includes("canary")) {
    return "canary";
  }

  return "latest";
}