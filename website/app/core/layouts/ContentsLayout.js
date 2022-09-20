import {Link, useRouter} from "blitz"
import clsx from "clsx"
import {createContext, Fragment, useCallback, useEffect, useState} from "react"
import {BiChevronLeft} from "react-icons/bi"
import {BsArrowLeft, BsArrowRight, BsCaretDownFill, BsCaretUpFill} from "react-icons/bs"
import {FaGithub} from "react-icons/fa"
import Select, {components} from "react-select"

import {PageHeader} from "@/components/PageHeader"
import {usePrevNext} from "@/hooks/usePrevNext"

export const ContentsContext = createContext()

export function TableOfContents({tableOfContents, currentSection}) {
  return (
    <div className="pl-8">
      <ul className="overflow-x-hidden text-black dark:text-dark-mode-text font-normal text-xs">
        {tableOfContents.map((section) => {
          let sectionIsActive =
            currentSection === section.slug ||
            section.children.findIndex(({slug}) => slug === currentSection) > -1

          return (
            <Fragment key={section.slug}>
              <li>
                <a
                  href={`#${section.slug}`}
                  className={clsx(
                    "block transform transition-colors duration-200 py-2 hover:text-gray-600 dark:hover:text-gray-300 no-underline",
                    {
                      "font-bold": sectionIsActive,
                    },
                  )}
                >
                  {section.title}
                </a>
              </li>
              {section.children.map((subsection) => {
                let subsectionIsActive = currentSection === subsection.slug

                return (
                  <li className="ml-2" key={subsection.slug}>
                    <a
                      href={`#${subsection.slug}`}
                      className={clsx(
                        "block py-2 transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300 no-underline",
                        {
                          "font-bold": subsectionIsActive,
                        },
                      )}
                    >
                      {subsection.title}
                    </a>
                  </li>
                )
              })}
            </Fragment>
          )
        })}
      </ul>
    </div>
  )
}

function useTableOfContents(tableOfContents) {
  let [currentSection, setCurrentSection] = useState(tableOfContents[0]?.slug)
  let [headings, setHeadings] = useState([])

  const registerHeading = useCallback((id, top) => {
    setHeadings((headings) => [...headings.filter((h) => id !== h.id), {id, top}])
  }, [])

  const unregisterHeading = useCallback((id) => {
    setHeadings((headings) => headings.filter((h) => id !== h.id))
  }, [])

  useEffect(() => {
    if (tableOfContents.length === 0 || headings.length === 0) return
    function onScroll() {
      let y = window.pageYOffset
      let windowHeight = window.innerHeight
      let sortedHeadings = headings.concat([]).sort((a, b) => a.top - b.top)
      if (y <= 0) {
        setCurrentSection(sortedHeadings[0].id)
        return
      }
      if (y + windowHeight >= document.body.scrollHeight) {
        setCurrentSection(sortedHeadings[sortedHeadings.length - 1].id)
        return
      }
      const middle = y + windowHeight / 2
      let current = sortedHeadings[0].id
      for (let i = 0; i < sortedHeadings.length; i++) {
        if (middle >= sortedHeadings[i].top) {
          current = sortedHeadings[i].id
        }
      }
      setCurrentSection(current)
    }
    window.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll, true)
  }, [headings, tableOfContents])

  return {currentSection, registerHeading, unregisterHeading}
}

const DropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <BsCaretUpFill size="10" className="text-black dark:text-dark-mode-text" />
        <BsCaretDownFill
          size="10"
          className="text-black dark:text-dark-mode-text"
          style={{marginTop: -2}}
        />
      </components.DropdownIndicator>
    )
  )
}

export function ContentsLayout({children, meta, tableOfContents: toc}) {
  const {registerHeading, unregisterHeading} = useTableOfContents(toc)
  let {prev, next} = usePrevNext()
  const router = useRouter()
  const [topic, setTopic] = useState(null)

  return (
    <>
      <Link href="/docs">
        <a className="lg:hidden mx-6 text-xxs px-2.5 py-0.5 rounded-sm bg-off-white font-primary inline-flex mb-4 dark:bg-purple-off-black -mt-4 items-center">
          <BiChevronLeft size={18} /> Back to Documentation Menu
        </a>
      </Link>
      <div id={meta.containerId} className="pt-4 pb-8 w-full flex">
        <div className="min-w-0 flex-auto px-6 sm:px-8 xl:px-12">
          <PageHeader title={meta.title} align={meta.titleAlign ?? "left"} />
          <div className={clsx("lg:hidden", {"mt-8 mb-12": toc.length, "h-px mt-12": !toc.length})}>
            {!!toc.length && (
              <>
                <h3 className="dark:text-dark-mode-text mb-2 text-sm">Topics</h3>
                <Select
                  value={topic}
                  className="topic-select"
                  classNamePrefix="topic-select"
                  options={toc.map((option) => ({value: option.slug, label: option.title}))}
                  placeholder="Jump to a Topic"
                  onChange={(e) => {
                    if (e && e.value) {
                      const hash = e.value
                      setTopic(null)
                      router.push({hash})
                    }
                  }}
                  components={{DropdownIndicator}}
                  styles={{
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? null : null,
                    }),
                  }}
                />
              </>
            )}
          </div>
          <ContentsContext.Provider value={{registerHeading, unregisterHeading}}>
            {children}
          </ContentsContext.Provider>
          {!meta.hideFooter && (
            <>
              <hr className="border-gray-200 mt-10 mb-4" />
              <a
                href={
                  "https://github.com/blitz-js/blitzjs.com/edit/main/app/pages" +
                  router.asPath.split("#")[0] +
                  ".mdx"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center py-2 text-sm"
              >
                <FaGithub className="mr-3" /> Idea for improving this page? Edit it on GitHub.
              </a>
              {(prev || next) && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between leading-7 text-lg font-semibold mt-8 mb-6">
                    {prev && (
                      <Link href={prev.href}>
                        <a className="flex items-center">
                          <BsArrowLeft className="icon-large mr-2 fill-current" />{" "}
                          {prev.sidebar_label || prev.title}
                        </a>
                      </Link>
                    )}
                    <div className="spacer px-3"></div>
                    {next && (
                      <Link href={next.href}>
                        <a className="flex justify-end">
                          <div className="flex items-center">
                            {next.sidebar_label || next.title}{" "}
                            <BsArrowRight className="icon-large ml-2 fill-current transform rotate-180" />
                          </div>
                        </a>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
