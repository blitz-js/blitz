import {Link} from '@blitzjs/core'
import {Form, Field} from 'react-final-form'
import {ProductCreateInput} from 'prisma'
import createProduct from 'app/products/mutations/createProduct_rpc'

export default function() {
  return (
    <div>
      <h1>Create a New Product</h1>
      <div>
        <Form
          initialValues={{name: null, handle: null, description: null, price: null}}
          onSubmit={async (data: ProductCreateInput) => {
            try {
              const product = await createProduct({data})
              alert('Success ' + JSON.stringify(product, null, 2))
            } catch (error) {
              alert(JSON.stringify(error, null, 2))
            }
          }}
          render={({handleSubmit}) => (
            <form onSubmit={handleSubmit} style={{maxWidth: 400}}>
              <div style={{marginBottom: 16}}>
                <label style={{display: 'flex', flexDirection: 'column'}}>
                  Product Name
                  <Field name="name" component="input" />
                </label>
              </div>

              <div style={{marginBottom: 16}}>
                <label style={{display: 'flex', flexDirection: 'column'}}>
                  Handle
                  <Field name="handle" component="input" />
                </label>
              </div>

              <div style={{marginBottom: 16}}>
                <label style={{display: 'flex', flexDirection: 'column'}}>
                  Description
                  <Field name="description" component="textarea" />
                </label>
              </div>

              <div style={{marginBottom: 16}}>
                <label style={{display: 'flex', flexDirection: 'column'}}>
                  Price
                  <Field name="price" component="input" parse={value => (value ? parseInt(value) : null)} />
                </label>
              </div>

              <button>Create Product</button>
            </form>
          )}
        />
      </div>
      <p>
        <Link href="/admin">
          <a>Store Admin</a>
        </Link>
      </p>
    </div>
  )
}
