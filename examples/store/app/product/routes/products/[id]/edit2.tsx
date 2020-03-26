import Router from 'next/router'
import {useQuery} from '@blitzjs/core'
import {Product} from 'app/product/ProductModel'
import getProduct from 'app/product/queries/getProduct'
import updateProduct from 'app/product/mutations/updateProduct'
import {Formik} from 'formik'

export default function({id}) {
  // status = 'loading' | 'error' | 'success'
  const [product, {status, error}] = useQuery(getProduct, {where: {id}})

  return (
    <div>
      <h1>{product.name}</h1>
      <Formik
        initialValues={product}
        validate={Product.validate}
        onSubmit={async values => {
          try {
            const res = await updateProduct(values)
            Router.push(`/products/${res.id}`)
          } catch (error) {
            alert('Error saving product')
          }
        }}>
        {({handleSubmit}) => <form onSubmit={handleSubmit}></form>}
      </Formik>
    </div>
  )
}
