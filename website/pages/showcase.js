import {useEffect, useState} from "react"

import {Header} from "@/components/Header"
import {Footer} from "@/components/home/Footer"
import {ShowcaseThumbnail} from "@/components/ShowcaseThumbnail"
import {SocialCards} from "@/components/SocialCards"
import showcaseList from "@/utils/showcaseList"

const ShowcasePage = () => {
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
        stickyBgclassName="bg-white dark:bg-purple-deep"
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
          <h1 className="font-primary text-3xl lg:text4xl xl:text-5xl font-semibold">Showcase</h1>
          <p className="font-secondary text-lg text-gray-600 dark:text-gray-300">
            Here are some beautiful websites built with Blitz.js
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {showcaseList.map(({title, thumbnail, URL}, index) => {
            return <ShowcaseThumbnail key={index} title={title} thumbnail={thumbnail} URL={URL} />
          })}
        </div>
        <div className="font-secondary text-base text-gray-600 dark:text-gray-300">
          Want to submit your website?{" "}
          <a
            href="https://github.com/blitz-js/blitzjs.com/edit/main/app/core/utils/showcaseList.js"
            target="_blank"
            rel="noreferrer"
            className="text-purple-light dark:text-purple-extralight font-medium dark:font-bold no-underline dark:underline hover:underline"
          >
            Here&apos;s a way to do that
          </a>
        </div>
      </main>
      <Footer className="text-black dark:text-dark-mode-text" hasDarkMode />
    </div>
  )
}
ShowcasePage.meta = {
  title: "Showcase - Blitz.js",
  description: `Blitz picks up where Next.js leaves off, providing battle-tested libraries and conventions for shipping and scaling world wide applications.`,
}

export default ShowcasePage
