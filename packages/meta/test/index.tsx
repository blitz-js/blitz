import * as React from 'react'
import {render, cleanup} from '@testing-library/react'

import {Meta} from '../src'

afterEach(cleanup)

test('Meta renders', () => {
  const {container, getByText} = render(<Meta />)
  expect(getByText('Blitz')).toBeTruthy()
  expect(container.querySelector('[property="og:title"][content="Blitz"]')).toBeTruthy()
  expect(container.querySelector('[name="twitter:title"][content="Blitz"]')).toBeTruthy()
  expect(container).toMatchSnapshot()
})

test('Meta renders custom title', () => {
  const title = 'Custom Title – Blitz'
  const {container, getByText} = render(<Meta title="Custom Title" />)
  expect(getByText(title)).toBeTruthy()
  expect(container.querySelector(`[property="og:title"][content="${title}"]`)).toBeTruthy()
  expect(container.querySelector(`[name="twitter:title"][content="${title}"]`)).toBeTruthy()
  expect(container).toMatchSnapshot()
})

test('Meta renders image', () => {
  const url = 'https://via.placeholder.com/1024x512'
  const {container} = render(<Meta image={url} />)
  expect(container.querySelector('meta[name="twitter:card"][content="summary_large_image"]')).toBeTruthy()
  expect(container.querySelector(`[content="${url}"]`)).toBeTruthy()
  expect(container).toMatchSnapshot()
})

test('Meta renders custom color', () => {
  const color = '#fff'
  const {container} = render(<Meta color={color} />)
  expect(container.querySelector(`meta[name="theme-color"][content="${color}"]`)).toBeTruthy()
  expect(container).toMatchSnapshot()
})
