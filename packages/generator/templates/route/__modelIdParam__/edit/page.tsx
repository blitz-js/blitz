import { Metadata } from "next"
import { Suspense } from "react"
import { invoke } from "src/app/blitz-server"
import get__ModelName__ from "../../queries/get__ModelName__"
import { Edit__ModelName__ } from "../../components/Edit__ModelName__"

type Edit__ModelName__PageProps = {
  params: { __modelId__: string }
}

export async function generateMetadata({ params }: Edit__ModelName__PageProps): Promise<Metadata> {
  const __ModelName__ = await invoke(get__ModelName__, { id: Number(params.__modelId__) })
  return {
    title: `Edit __ModelName__ ${__ModelName__.id} - ${__ModelName__.name}`,
  }
}

export default async function Page({ params }: Edit__ModelName__PageProps) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Edit__ModelName__ __modelId__={Number(params.__modelId__)} />
      </Suspense>
    </div>
  )
}
