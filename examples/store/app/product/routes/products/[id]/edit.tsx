import {getProduct} from 'app/product/queries'
import {updateProduct} from 'app/product/mutations'
import Router from 'next/router'
import {Formik} from 'formik'

export default getProduct.page(({product}) => (
  <div>
    <h1>{product.name}</h1>
    <Formik
      initialValues={product}
      validate={updateProduct.validateInput}
      onSubmit={async values => {
        const res = await updateProduct.remote(values)
        if (res.ok) Router.push(`/products/${res.result.id}`)
      }}>
      {({handleSubmit}) => <form onSubmit={handleSubmit}></form>}
    </Formik>
  </div>
))
