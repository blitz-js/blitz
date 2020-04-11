import {deserializeError} from 'serialize-error'
import createProduct from './createProduct'

export default (async function(params) {
  const result = await fetch('/api/products/mutations/createProduct', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify({params}),
  })

  const json = await result.json()

  if (json.result) {
    return json.result
  } else {
    throw deserializeError(json.error)
  }
} as typeof createProduct)
