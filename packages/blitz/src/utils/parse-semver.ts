export function parseSemver(semver: string) {
  if (semver.startsWith("v")) {
    semver = semver.substring(1)
  }

  const [major, minor, patch] = semver.split(".").map(Number)

  return {major, minor, patch}
}
