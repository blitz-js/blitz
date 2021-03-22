export function addPrismaGenerator(
  program: string,
  generatorName: string,
  generatorBody: string,
): string {
  if (program.includes(`generator ${generatorName} {`)) return program

  const prismaGenerator = `
generator ${generatorName} {
  ${generatorBody}
}`.trim()

  // Find the first generator and insert this entry there, otherwise at the top of the file.
  const index = Math.max(program.indexOf("generator "), 0)
  return [program.slice(0, index), prismaGenerator, program.slice(index)].join("\n")
}
