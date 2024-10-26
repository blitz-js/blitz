import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { invoke } from "src/app/blitz-server"
import get__ModelName__ from "../queries/get__ModelName__"
import { __ModelName__ } from "../components/__ModelName__"

export async function generateMetadata(props: __ModelName__PageProps): Promise<Metadata> {
  const params = await props.params;
  const __ModelName__ = await invoke(get__ModelName__, { id: Number(params.__modelId__) })
  return {
    title: `__ModelName__ ${__ModelName__.id} - ${__ModelName__.name}`,
  }
}

type __ModelName__PageProps = {
  params: Promise<{ __modelId__: string }>
}

export default async function Page(props: __ModelName__PageProps) {
  const params = await props.params;
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
