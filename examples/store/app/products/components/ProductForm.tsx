import {Form, Field} from 'react-final-form'
import {Product, ProductCreateInput, ProductUpdateInput} from 'prisma'
import createProduct from 'app/products/mutations/createProduct'
import updateProduct from 'app/products/mutations/updateProduct'

type ProductInput = ProductCreateInput | ProductUpdateInput

function isNew(product: ProductInput): product is ProductCreateInput {
  return (product as ProductUpdateInput).id === undefined
}

type ProductFormProps = {
  product?: ProductUpdateInput
  style?: React.CSSProperties
  onSuccess: (product: Product) => any
}

export default function({product, style, onSuccess, ...props}: ProductFormProps) {
  return (
    <Form
      initialValues={product || {name: null, handle: null, description: null, price: null}}
      onSubmit={async (data: ProductInput) => {
        if (isNew(data)) {
          try {
            const product = await createProduct({data})
            onSuccess(product)
          } catch (error) {
            alert('Error creating product ' + JSON.stringify(error, null, 2))
          }
        } else {
          try {
            const product = await updateProduct({where: {id: data.id}, data})
            onSuccess(product)
          } catch (error) {
            alert('Error updating product ' + JSON.stringify(error, null, 2))
          }
        }
      }}
      render={({handleSubmit}) => (
        <form onSubmit={handleSubmit} style={{maxWidth: 400, ...style}} {...props}>
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

          <button>{product ? 'Update' : 'Create'} Product</button>
        </form>
      )}
    />
  )
}
