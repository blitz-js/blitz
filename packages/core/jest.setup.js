require('@testing-library/jest-dom')

global.fetch = jest.fn(() => Promise.resolve({json: () => ({result: null, error: null})}))
