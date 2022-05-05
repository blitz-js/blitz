import {describe, it, expect, beforeAll} from "vitest"
import { screen, waitForElementToBeRemoved, act,  } from '@testing-library/react'
import {useQuery} from '@blitzjs/rpc'
import React from 'react'
import delay from 'delay'
import {buildQueryRpc, render} from '../blitz-test-utils'

beforeAll(() => {
  globalThis.__BLITZ_SESSION_COOKIE_PREFIX = "qm-test-cookie-prefix"
})

// describe('useQuery', () => {

//   const setupHook = (
//     params: any,
//     queryFn: (...args: any) => any,
//   ): [{ data?: any; setQueryData?: any }, Function] => {
//     let res = {}
//     function TestHarness() {
//       const [data, { setQueryData }] = useQuery(queryFn, params, {
//         suspense: true,
//       } as any)
//       Object.assign(res, { data, setQueryData })
//       return (
//         <div id="harness">
//           <span>{data ? 'Ready' : 'No data'}</span>
//           <span>{data}</span>
//         </div>
//       )
//     }

//     const ui = () => (
//       <React.Suspense fallback="Loading...">
//         <TestHarness />
//       </React.Suspense>
//     )

//     const { rerender } = render(ui())
//     return [res, () => rerender(ui())]
//   }

//   describe('a "query" that converts the string parameter to uppercase', () => {
//     const upcase = async (args: string) => {
//       await delay(1000)
//       return args.toUpperCase()
//     }
//     it('should work with Blitz queries', async () => {
//       const [res] = setupHook('test', buildQueryRpc(upcase))
//       await waitForElementToBeRemoved(() => screen.getByText('Loading...'))
//       await act(async () => {
//         await screen.findByText('Ready')
//         expect(res.data).toBe('TEST')
//       })
//     })
//   })
// })