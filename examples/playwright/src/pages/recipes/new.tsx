import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "src/core/layouts/Layout"
import { CreateRecipeSchema } from "src/recipes/schemas"
import createRecipe from "src/recipes/mutations/createRecipe"
import { RecipeForm, FORM_ERROR } from "src/recipes/components/RecipeForm"
import { Suspense } from "react"

const NewRecipePage = () => {
  const router = useRouter()
  const [createRecipeMutation] = useMutation(createRecipe)

  return (
    <Layout title={"Create New Recipe"}>
      <h1>Create New Recipe</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <RecipeForm
          submitText="Create Recipe"
          schema={CreateRecipeSchema}
          // initialValues={{}}
          onSubmit={async (values) => {
            try {
              const recipe = await createRecipeMutation(values)
              await router.push(Routes.ShowRecipePage({ recipeId: recipe.id }))
            } catch (error: any) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </Suspense>
      <p>
        <Link href={Routes.RecipesPage()}>Recipes</Link>
      </p>
    </Layout>
  )
}

NewRecipePage.authenticate = true

export default NewRecipePage
