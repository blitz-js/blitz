import {Link} from "blitz"
import {useRouter} from "blitz"
import {useEffect, useState} from "react"
import {AiOutlineClose, AiOutlineMenu} from "react-icons/ai"
import {FaDiscord, FaGithub, FaTwitter} from "react-icons/fa"
import {FaHeart} from "react-icons/fa"
import {FiArrowUpRight} from "react-icons/fi"
import {HiExternalLink} from "react-icons/hi"

import Banner from "@/components/Banner"
import ColoredLogo from "@/components/ColoredLogo"
import {DarkModeToggle} from "@/components/DarkModeToggle"
import Logo from "@/components/Logo"
import {NavLink} from "@/components/NavLink"
import {Search} from "@/components/Search"
import {useIsDesktop} from "@/hooks/useIsDesktop"

const SocialIcons = ({className, variant}) => {
  const outerClasses = variant === "bright" ? "bg-purple-light dark:bg-white" : "bg-white "
  const innerClasses =
    variant === "bright"
      ? "text-white dark:text-purple-mid"
      : "text-purple-primary dark:text-purple-dark"
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <a
        href="https://github.com/blitz-js/blitz"
        target="_blank"
        rel="noopener noreferrer"
        className={"rounded-full w-7 h-7 flex items-center justify-center " + outerClasses}
      >
        <FaGithub className={" " + innerClasses} size="1rem" />
      </a>
      <a
        href="https://twitter.com/blitz_js"
        target="_blank"
        rel="noopener noreferrer"
        className={"rounded-full w-7 h-7 flex items-center justify-center " + outerClasses}
      >
        <FaTwitter className={" " + innerClasses} size="1rem" />
      </a>
      <a
        href="https://discord.blitzjs.com"
        target="_blank"
        rel="noopener noreferrer"
        className={"rounded-full w-7 h-7 flex items-center justify-center " + outerClasses}
      >
        <FaDiscord className={" " + innerClasses} size="1rem" />
      </a>
    </div>
  )
}
const bannerMsg = (
  <div>
    🚀
    <a
      href="https://flightcontrol.dev?ref=blitzjs"
      rel="noreferrer"
      target="_blank"
      className="underline"
    >
      Announcing Flightcontrol
    </a>{" "}
    - Easily Deploy Blitz.js and Next.js to AWS 🚀
  </div>
)

const Header = ({
  className = "",
  hasLightBg,
  useColoredLogo,
  stickyBgClass,
  hasFade,
  onNavToggle,
}) => {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  let [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    function handleRouteChange() {
      setIsOpen(false)
    }
    router.events.on("routeChangeComplete", handleRouteChange)
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [isOpen, router.events])

  const onToggle = () => {
    const newValue = !isOpen
    setIsOpen(newValue)
    onNavToggle(newValue)
  }

  const menuLinks = [
    {
      name: "Documentation",
      href: isDesktop ? "/docs/get-started" : "/docs",
    },
    {
      name: "Showcase",
      href: "/showcase",
    },
    {name: "Releases", href: "https://github.com/blitz-js/blitz/releases"},
    {name: "Swag", href: "https://store.blitzjs.com"},
    {name: "Deploy with Flightcontrol", href: "https://flightcontrol.dev?ref=blitzjs"},
  ]

  return (
    <>
      {bannerMsg && <Banner message={bannerMsg} hasLightBg={hasLightBg} className="pt-3" />}
      <nav className={`${stickyBgClass ? "sticky top-0 z-50" : ""}`}>
        <div className={`flex items-center justify-between lg:mt-4 ${className} ${stickyBgClass}`}>
          <div className="pr-8 xl:pr-12 lg:-mt-3">
            <Link href="/">
              <a className="w-10 overflow-hidden md:w-auto">
                <span className="sr-only">Blitz home page</span>
                {useColoredLogo && (
                  <ColoredLogo className="w-auto h-12 py-2 fill-current inline dark:hidden" />
                )}
                <Logo
                  className={`w-auto h-12 py-2 fill-current ${
                    useColoredLogo ? "hidden dark:inline" : ""
                  }`}
                />
              </a>
            </Link>
          </div>
          <div className="flex-1 hidden space-x-4 xl:space-x-6 text-base lg:flex">
            {menuLinks.map((link) => {
              const external = link.href.startsWith("http")
              const props = external ? {target: "_blank", rel: "noopener noreferrer"} : {}
              return (
                <NavLink href={link.href} key={link.href + link.name} {...props}>
                  {link.name}
                  {external && (
                    <FiArrowUpRight size="0.65rem" className="opacity-40 absolute top-2 right-0" />
                  )}
                </NavLink>
              )
            })}
          </div>
          <div className="flex lg:text-base xl:space-x-4">
            <Search className="self-center" />
            <button
              onClick={onToggle}
              className="p-2 transition-opacity rounded-md lg:hidden focus:ring-2 focus:outline-none focus:ring-inset focus:ring-white"
            >
              {isOpen ? <AiOutlineClose size="1.375rem" /> : <AiOutlineMenu size="1.375rem" />}
            </button>
            <DarkModeToggle className="hidden text-base lg:my-2 lg:block" />
            <SocialIcons
              className="hidden lg:flex"
              variant={useColoredLogo ? "bright" : "normal"}
            />
          </div>
        </div>
        {isOpen && (
          <div
            className={`h-screen pt-4 text-2xl lg:hidden dark:bg-purple-deep space-y-1 ${className} ${
              useColoredLogo ? "bg-white" : ""
            }`}
          >
            {menuLinks.map((link) => {
              const external = link.href.startsWith("http")
              const props = external ? {target: "_blank", rel: "noopener noreferrer"} : {}
              return (
                <NavLink href={link.href} key={link.href + link.name} {...props}>
                  {link.name}
                  {external && (
                    <HiExternalLink size="1rem" className="opacity-70 absolute top-3 right-0" />
                  )}
                </NavLink>
              )
            })}
            <NavLink
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/sponsors/blitz-js"
            >
              <FaHeart size="1rem" className="inline mr-1 mb-1 align-text-center" /> Donate/Sponsor
              <HiExternalLink size="1rem" className="opacity-70 absolute top-3 right-0" />
            </NavLink>
            <div className="py-2">
              <div className="border-t border-black dark:border-off-white border-opacity-50"></div>
            </div>
            <div className="space-y-3">
              <DarkModeToggle className="text-lg -ml-3" />
              <SocialIcons variant={useColoredLogo ? "bright" : "normal"} />
            </div>
          </div>
        )}
        {hasFade && (
          <div className="absolute bg-gradient-to-b from-white dark:from-purple-deep h-12 lg:block pointer-events-none w-full z-10"></div>
        )}
      </nav>
    </>
  )
}

export {Header}
