import {useEffect, useState} from "react"

import {Header} from "@/components/Header"
import {Footer} from "@/components/home/Footer"
import {SocialCards} from "@/components/SocialCards"
import {Title} from "@/components/Title"
import {ContentsLayout} from "@/layouts/ContentsLayout"
import {SidebarLayout} from "@/layouts/SidebarLayout"
import documentationNav from "@/navs/documentation.json"

export function DocumentationLayout({children, ...props}) {
  const [navIsOpen, setNavIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = navIsOpen ? "hidden" : "unset"
  }, [navIsOpen])

  return (
    <div className="bg-white dark:bg-purple-deep pb-1 md:pb-3">
      <Title>{props?.meta?.title}</Title>

      <SocialCards imageUrl="/social-docs.png" />
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
      <div className="max-w-7xl mx-auto font-secondary dark:">
        <SidebarLayout nav={documentationNav} {...props}>
          <ContentsLayout {...props}>{children}</ContentsLayout>
        </SidebarLayout>
      </div>
      <Footer className="text-black dark:text-dark-mode-text" hasDarkMode />
    </div>
  )
}
