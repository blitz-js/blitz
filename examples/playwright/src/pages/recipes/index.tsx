import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "src/core/layouts/Layout"
import getRecipes from "src/recipes/queries/getRecipes"

const ITEMS_PER_PAGE = 100

export const RecipesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ recipes, hasMore }] = usePaginatedQuery(getRecipes, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link href={Routes.ShowRecipePage({ recipeId: recipe.id })}>{recipe.name}</Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const RecipesPage = () => {
  return (
    <Layout>
      <Head>
        <title>Recipes</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewRecipePage()}>Create Recipe</Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <RecipesList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default RecipesPage
