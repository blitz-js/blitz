import {Octokit} from "@octokit/rest"
import {useEffect, useState} from "react"

import {Header} from "@/components/Header"
import {Footer} from "@/components/home/Footer"
import {SocialCards} from "@/components/SocialCards"
import {getGitHubFile} from "@/utils/getGitHubFile"

const LanguagesPage = ({languages}) => {
  const [navIsOpen, setNavIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = navIsOpen ? "hidden" : "unset"
  }, [navIsOpen])

  return (
    <div className="relative pb-1 md:pb-3 min-h-screen bg-white dark:bg-purple-deep">
      <SocialCards imageUrl="/social-homepage.png" />
      <Header
        className="px-6 mx-auto max-w-7xl"
        hasLightBg
        useColoredLogo
        stickyBgClass="bg-white dark:bg-purple-deep"
        hasFade
        onNavToggle={(isOpen) => {
          setNavIsOpen(isOpen)
        }}
      />
      <div
        className={
          "absolute w-full h-full row-start-1 row-end-5 background-to-video rounded-bl-3xl xl:rounded-bl-4xl bg-gradient-to-b from-purple-mid to-purple-primary dark:from-black dark:to-purple-off-black " +
          (navIsOpen ? "z-20 fixed" : "-z-10")
        }
      ></div>
      <main className="mx-auto max-w-7xl px-6 py-24 xl:py-36 text-black dark:text-dark-mode-text space-y-16 lg:space-y-20">
        <div className="space-y-6">
          <h1 className="font-primary text-3xl lg:text4xl xl:text-5xl font-semibold">Languages</h1>
          <p className="font-secondary text-lg text-gray-600 dark:text-gray-300">
            The Blitz documentation is currently being translated into the following languages:
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-12 gap-y-6">
          {languages.map((lang) => (
            <div key={lang.code}>
              <h3 className="xl:mb-0 text-xl">{lang.name}</h3>
              <p className="text-sm font-secondary">
                {lang.completition}% —{" "}
                <a
                  href={`https://github.com/blitz-js/${lang.code}.blitzjs.com/issues/1`}
                  className="text-purple-light dark:text-purple-extralight font-medium dark:font-bold no-underline dark:underline hover:underline"
                >
                  Help Translate
                </a>
              </p>
            </div>
          ))}
        </div>
        <div className="font-secondary text-base text-gray-600 dark:text-gray-300">
          Don&apos;t see your language?{" "}
          <a
            href="https://github.com/blitz-js/blitzjs.com-translation#starting-a-new-translation"
            target="_blank"
            rel="noreferrer"
            className="text-purple-light dark:text-purple-extralight font-medium dark:font-bold no-underline dark:underline hover:underline"
          >
            Read how to start a new translation
          </a>
        </div>
      </main>
      <Footer className="text-black dark:text-dark-mode-text" hasDarkMode />
    </div>
  )
}

const getStaticProps = async () => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_AUTH_TOKEN,
  })

  // Theorically, this will break when we reach 1000+ languages
  const {data} = await octokit.repos.getContent({
    owner: "blitz-js",
    repo: "blitzjs.com-translation",
    path: "langs",
  })

  const languages = await Promise.all(
    data.map(async (lang) => {
      const [langMeta, {data: langIssue}] = await Promise.all([
        // Gets each lang.json content, because it doesn't come with the first request `data`
        getGitHubFile({
          octokit,
          owner: "blitz-js",
          repo: "blitzjs.com-translation",
          path: lang.path,
          json: true,
        }),
        octokit.issues.get({
          owner: "blitz-js",
          repo: `${lang.name.substr(0, lang.name.length - 5)}.blitzjs.com`,
          issue_number: 1,
        }),
      ])

      const checkedBoxes = langIssue.body.match(/\* \[x\]/gi)
      const totalBoxes = langIssue.body.match(/\* \[(x| )?\]/gi)

      // Instead of returning an empty array when there aren't any matches, `match` returns `undefined`,
      // so this checks for empty arrays (and prevents dividing by 0)
      const completition = !totalBoxes
        ? 100
        : !checkedBoxes
        ? 0
        : Math.round((checkedBoxes.length / totalBoxes.length) * 100)

      return {...langMeta, completition}
    }),
  )

  return {
    props: {
      languages: languages.sort((a, b) =>
        a.completition === b.completition
          ? a.name.localeCompare(b.name)
          : a.completition > b.completition,
      ),
    },
    revalidate: 3 * 60 * 60, // 3 hours
  }
}

LanguagesPage.meta = {
  title: "Languages - Blitz.js",
  description: `Blitz picks up where Next.js leaves off, providing battle-tested libraries and conventions for shipping and scaling world wide applications.`,
}

export default LanguagesPage
export {getStaticProps}
