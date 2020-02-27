import React from 'react'
import Router from 'next/router'
import {render, wait, fireEvent} from '@testing-library/react'
import Form from '../../src/components/Form'
jest.mock('next/router')

describe('Form', () => {
  const TestHarness = () => (
    <Form>
      <label htmlFor="title">Title</label>
      <input id="title" name="title" type="text" defaultValue="test" />
      <button type="submit">Submit</button>>
    </Form>
  )

  const mockFetch = (res: any = {ok: true}) => {
    ;(global as any).fetch = jest.fn().mockImplementation(async () => res)
  }

  const submitForm = async (page: any) => {
    const form = await page.findByRole('form')
    const button = await page.findByRole('button')
    fireEvent.click(button, {target: form})
    await wait()
  }

  beforeEach(() => mockFetch())

  it('renders', async () => {
    const page = await render(<TestHarness />)
    expect(page.getByLabelText('Title')).toHaveValue('test')
  })

  describe('with redirect', () => {
    beforeEach(() => {
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
