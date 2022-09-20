import slugify from "@sindresorhus/slugify"
import fs from "fs/promises"
import path from "path"

async function main() {
  const docsPath = path.resolve(process.cwd(), "app", "pages", "docs")
  let files = await fs.readdir(docsPath)
  files = files.map((files) => path.resolve(docsPath, files))

  await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, {encoding: "utf-8"})

      let slugs = []
      const lines = content.split("\n").map((line) => {
        if (/^###? .+/.test(line)) {
          if (/ {#.+}$/.test(line)) {
            const [, slug] = line.split(" {#", 2)
            slugs.push(slug.substr(0, slug.length - 1))

            return line
          } else {
            let slug = slugify(line.substr(line.startsWith("## ") ? 3 : 4))

            if (slugs.includes(slug)) {
              for (let n = 1; true; n++) {
                if (!slugs.includes(`${slug}-${n}`)) {
                  slug = `${slug}-${n}`
                  break
                }
              }
            }

            slugs.push(slug)
            return `${line} {#${slug}}`
          }
        } else {
          return line
        }
      })

      await fs.writeFile(file, lines.join("\n"))
    }),
  )
}

main()
