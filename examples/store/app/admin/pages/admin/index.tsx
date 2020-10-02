import {Link} from "blitz"

function StoreAdminPage() {
  return (
    <div>
      <h1>Store Admin</h1>
      <div>
        <p>
          <Link href="/admin/products">
            <a>Manage Products</a>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default StoreAdminPage
