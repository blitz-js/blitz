import {fireEvent, render, RenderResult, wait} from '@testing-library/react'
import Router from 'next/router'
import React, {FC} from 'react'
import Form from '../../src/components/Form'
jest.mock('next/router')

/**
 * Creates a mock implementation of fetch which will resolve asynchronously with the provided `res` param
 * @param res The response that will be sent back
 */
function mockFetch(res: any = {ok: true}) {
  Object.assign(global, {
    fetch: jest.fn().mockImplementation(async () => res),
  })
}

describe('Form', () => {
  beforeAll(() => {
    mockFetch()
  })

  const TestHarness: FC = () => (
    <Form>
      <label htmlFor="title">Title</label>
      <input id="title" name="title" type="text" defaultValue="test" />
      <button type="submit">Submit</button>>
    </Form>
  )

  const submitForm = async (page: RenderResult) => {
    const form = await page.findByRole('form')
    const button = await page.findByRole('button')
    fireEvent.click(button, {target: form})
    await wait()
  }

  it('renders', async () => {
    const page = await render(<TestHarness />)
    expect(page.getByLabelText('Title')).toHaveValue('test')
  })

  describe('with redirect', () => {
    beforeAll(() => {
      const headers = {Location: 'location', 'x-as': 'xas'} as any
      mockFetch({
        ok: true,
        headers: {
          get: jest.fn().mockImplementation(key => headers[key]),
        },
      })
    })

    it('triggers routing', async () => {
      const page = await render(<TestHarness />)
      await submitForm(page)

      expect(Router.push).toBeCalledWith('location', 'xas')
    })
  })
})
