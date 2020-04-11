import {Link} from '@blitzjs/core'
import {Formik, Form, Field} from 'formik'

export default function() {
  return (
    <div>
      <h1>Create a New Product</h1>
      <div>
        <Formik
          initialValues={{name: null, handle: null, description: null, price: null}}
          onSubmit={(values, {setSubmitting}) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2))
              setSubmitting(false)
            }, 400)
          }}>
          {({isSubmitting}) => (
            <Form>
              <Field name="name" />
              <Field name="handle" />
              <Field name="description" as="textinput" />
              <Field name="price" />
              <button type="submit" disabled={isSubmitting}>
                Create
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <p>
        <Link href="/admin">
          <a>Store Admin</a>
        </Link>
      </p>
    </div>
  )
}
