import {Link} from '@blitzjs/core'

export default function() {
  return (
    <div>
      <h1>Store Admin</h1>
      <div>
        <p>
          <Link href="/admin/products/new">
            <a>Create Product</a>
          </Link>
        </p>
      </div>
    </div>
  )
}
