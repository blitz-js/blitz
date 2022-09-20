export async function getGitHubFile({octokit, owner, repo, path, json = false}) {
  const {data: file} = await octokit.repos.getContent({
    owner,
    repo,
    path,
  })

  if (Array.isArray(file) || !("content" in file)) {
    throw new Error(`"${path} isn't a file in "${owner}/${repo}`)
  }

  const rawContent = Buffer.from(file.content, "base64").toString("utf-8")

  return json ? JSON.parse(rawContent) : rawContent
}
