import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "src/core/layouts/Layout"
import { UpdateRecipeSchema } from "src/recipes/schemas"
import getRecipe from "src/recipes/queries/getRecipe"
import updateRecipe from "src/recipes/mutations/updateRecipe"
import { RecipeForm, FORM_ERROR } from "src/recipes/components/RecipeForm"

export const EditRecipe = () => {
  const router = useRouter()
  const recipeId = useParam("recipeId", "number")
  const [recipe, { setQueryData }] = useQuery(
    getRecipe,
    { id: recipeId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateRecipeMutation] = useMutation(updateRecipe)

  return (
    <>
      <Head>
        <title>Edit Recipe {recipe.id}</title>
      </Head>

      <div>
        <h1>Edit Recipe {recipe.id}</h1>
        <pre>{JSON.stringify(recipe, null, 2)}</pre>
        <Suspense fallback={<div>Loading...</div>}>
          <RecipeForm
            submitText="Update Recipe"
            schema={UpdateRecipeSchema}
            initialValues={recipe}
            onSubmit={async (values) => {
              try {
                const updated = await updateRecipeMutation({
                  ...values,
                })
                await setQueryData(updated)
                await router.push(Routes.ShowRecipePage({ recipeId: updated.id }))
              } catch (error: any) {
                console.error(error)
                return {
                  [FORM_ERROR]: error.toString(),
                }
              }
            }}
          />
        </Suspense>
      </div>
    </>
  )
}

const EditRecipePage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditRecipe />
      </Suspense>

      <p>
        <Link href={Routes.RecipesPage()}>Recipes</Link>
      </p>
    </div>
  )
}

EditRecipePage.authenticate = true
EditRecipePage.getLayout = (page) => <Layout>{page}</Layout>

export default EditRecipePage
