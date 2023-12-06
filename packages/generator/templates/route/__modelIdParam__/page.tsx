import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { invoke } from "app/src/blitz-server"
import get__ModelName__ from "../queries/get__ModelName__"
import { __ModelName__ } from "../components/__ModelName__"

export async function generateMetadata({ params }: __ModelName__PageProps): Promise<Metadata> {
  const __ModelName__ = await invoke(get__ModelName__, { id: Number(params.__ModelName__Id) })
  return {
    title: `__ModelName__ ${__ModelName__.id} - ${__ModelName__.name}`,
  }
}

type __ModelName__PageProps = {
  params: { __modelId__: string }
}

export default async function Page({ params }: __ModelName__PageProps) {
  return (
    <div>
      <p>
        <Link href={"/__modelName__s"}>__ModelName__s</Link>
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <__ModelName__ __modelId__={Number(params.__modelId__)} />
      </Suspense>
    </div>
  )
}
