import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "src/core/layouts/Layout"
import getRecipe from "src/recipes/queries/getRecipe"
import deleteRecipe from "src/recipes/mutations/deleteRecipe"

export const Recipe = () => {
  const router = useRouter()
  const recipeId = useParam("recipeId", "number")
  const [deleteRecipeMutation] = useMutation(deleteRecipe)
  const [recipe] = useQuery(getRecipe, { id: recipeId })

  return (
    <>
      <Head>
        <title>Recipe {recipe.id}</title>
      </Head>

      <div>
        <h1>Recipe {recipe.id}</h1>
        <pre>{JSON.stringify(recipe, null, 2)}</pre>

        <Link href={Routes.EditRecipePage({ recipeId: recipe.id })}>Edit</Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteRecipeMutation({ id: recipe.id })
              await router.push(Routes.RecipesPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowRecipePage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.RecipesPage()}>Recipes</Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Recipe />
      </Suspense>
    </div>
  )
}

ShowRecipePage.authenticate = true
ShowRecipePage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowRecipePage
