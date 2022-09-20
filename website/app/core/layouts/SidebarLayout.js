import {Link, useRouter} from "blitz"
import clsx from "clsx"
import {createContext, forwardRef, Fragment, useEffect, useRef} from "react"

import {PageHeader} from "@/components/PageHeader"
import {SidebarTitle} from "@/components/SidebarTitle"
import {useIsDesktop} from "@/hooks/useIsDesktop"
import {useIsDocsIndex} from "@/hooks/useIsDocsIndex"
import {useIsomorphicLayoutEffect} from "@/hooks/useIsomorphicLayoutEffect"
import {TableOfContents} from "@/layouts/ContentsLayout"

export const SidebarContext = createContext()

const NavItem = forwardRef(({href, children, isActive, isPublished, fallbackHref}, ref) => {
  return (
    <li ref={ref}>
      <Link href={isPublished ? href : fallbackHref}>
        <a
          className={clsx("px-3 py-2 transition-colors duration-200 relative block font-semibold", {
            underline: isActive,
            "hover:underline": !isActive && isPublished,
            "text-gray-400": !isActive && !isPublished,
          })}
          style={{letterSpacing: 0.3}}
        >
          <span className="relative">{children}</span>
        </a>
      </Link>
    </li>
  )
})

function Nav({nav, children, fallbackHref, toc}) {
  const router = useRouter()
  const activeItemRef = useRef()
  const scrollRef = useRef()

  useIsomorphicLayoutEffect(() => {
    if (activeItemRef.current) {
      const scrollRect = scrollRef.current.getBoundingClientRect()
      const activeItemRect = activeItemRef.current.getBoundingClientRect()
      scrollRef.current.scrollTop =
        activeItemRect.top - scrollRect.top - scrollRect.height / 2 + activeItemRect.height / 2
    }
  }, [])

  return (
    // eslint-disable-next-line
    <div
      id="navWrapper"
      onClick={(e) => e.stopPropagation()}
      className="h-full scrolling-touch lg:h-auto lg:block lg:sticky lg:bg-transparent overflow-hidden lg:top-18 bg-white dark:bg-purple-deep mr-24 lg:mr-0"
    >
      <div className="absolute bg-gradient-to-b from-white dark:from-purple-deep h-12 lg:block pointer-events-none w-full z-10"></div>
      <nav
        id="nav"
        ref={scrollRef}
        className="px-1 bg-white dark:bg-purple-deep font-medium text-base sm:px-3 xl:px-5 pb-10 lg:pb-16 sticky?lg:h-(screen-18) lg:overflow-y-auto"
      >
        <ul className="space-y-16 mt-10">
          {children}
          {nav &&
            nav
              .map((category) => {
                let publishedItems = category.pages.filter((item) => item.published !== false)
                if (publishedItems.length === 0 && !fallbackHref) return null
                return (
                  <li key={category.title.title} className="">
                    <SidebarTitle {...category.title} />
                    <ul>
                      {(fallbackHref ? category.pages : publishedItems).map((item, i) => (
                        <Fragment key={i}>
                          <NavItem
                            href={item.displayUrl ?? item.href}
                            isActive={item.href === router.pathname}
                            ref={item.href === router.pathname ? activeItemRef : undefined}
                            isPublished={item.published !== false}
                            fallbackHref={fallbackHref}
                          >
                            {item.sidebar_label || item.title}
                          </NavItem>
                          {item.href === router.pathname && toc && toc.length ? (
                            <TableOfContents tableOfContents={toc} />
                          ) : null}
                        </Fragment>
                      ))}
                    </ul>
                  </li>
                )
              })
              .filter(Boolean)}
        </ul>
      </nav>
    </div>
  )
}

export function SidebarLayout({children, nav, sidebar, fallbackHref, tableOfContents}) {
  const router = useRouter()
  const isDocsIndex = useIsDocsIndex()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (isDesktop && isDocsIndex) {
      router.push("/docs/get-started")
    }
  }, [router, isDesktop, isDocsIndex])

  return (
    <SidebarContext.Provider value={{nav}}>
      <div
        className={clsx("w-full max-w-8xl mx-auto lg:mt-16", {
          "mt-10": true,
        })}
      >
        <div className="lg:flex">
          {/* eslint-disable-next-line */}
          <div
            id="sidebar"
            className="hidden fixed z-40 inset-0 flex-none h-full bg-opacity-25 w-full lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-80 xl:w-96 lg:block"
          >
            <Nav nav={nav} fallbackHref={fallbackHref} toc={tableOfContents}>
              {sidebar}
            </Nav>
          </div>
          <div
            id="content-wrapper"
            className="min-w-0 w-full flex-auto lg:static lg:overflow-visible max-w-3xl"
          >
            {isDocsIndex && !isDesktop ? (
              <div className="">
                <div className="px-4 lg:px-8">
                  <PageHeader title="Docs" />
                </div>
                <Nav nav={nav} fallbackHref={fallbackHref} toc={tableOfContents}>
                  {sidebar}
                </Nav>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
