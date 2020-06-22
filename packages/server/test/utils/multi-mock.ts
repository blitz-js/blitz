import mockFileSystem from "mock-fs"

const mockFs = (...args: any[]) => {
  // Fixes an issue with mockFs around console log in tests and dependencies
  // This is a magic workaround until mock-fs provides an overlay functionality
  // Tried using union fs and memfs but it wasn't working properly
  // https://github.com/facebook/jest/issues/5792#issuecomment-377861996
  console.log("")
  mockFileSystem(...args)
}

// We may need to add more methods here if we need them
mockFs.restore = mockFileSystem.restore

/**
 * Mock multiple dependencies at once for a test. Returns a mock
 * object containing the references to your mock functions you can use
 * to test against.
 *
 * Use this at the start of your test before anything else.
 * @param mocks Object representing the the require mocks you want
 * @returns mocks utility object
 */

export function multiMock<T extends Record<string, any>>(mocks: T, cwd: string = process.cwd()) {
  const {join} = jest.requireActual("path")
  Object.entries(mocks).forEach(([path, obj]) => {
    const moduleName = join(cwd, path)
    jest.doMock(moduleName, () => obj)
  })

  return Object.assign(mocks, {mockFs})
}
