import {DocSearchModal, useDocSearchKeyboardEvents} from "@docsearch/react"
import {Head, Link, useRouter} from "blitz"
import {useCallback, useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom"
import {BiSearch} from "react-icons/bi"

const ACTION_KEY_DEFAULT = ["Ctrl ", "Control"]
const ACTION_KEY_APPLE = ["⌘", "Command"]

function Hit({hit, children}) {
  return (
    <Link href={hit.url}>
      <a>{children}</a>
    </Link>
  )
}

export function Search({className = ""}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const searchButtonRef = useRef()
  const [initialQuery, setInitialQuery] = useState(null)
  const [, setActionKey] = useState()

  const onOpen = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const onInput = useCallback(
    (e) => {
      setIsOpen(true)
      setInitialQuery(e.key)
    },
    [setIsOpen, setInitialQuery],
  )

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    onInput,
    searchButtonRef,
  })

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
        setActionKey(ACTION_KEY_APPLE)
      } else {
        setActionKey(ACTION_KEY_DEFAULT)
      }
    }
  }, [])

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://BH4D9OD16A-dsn.algolia.net" crossOrigin="true" />
      </Head>
      <button
        type="button"
        ref={searchButtonRef}
        onClick={onOpen}
        className={`py-2 px-3 rounded-md focus:outline-none focus:ring-inset focus:ring-white focus:ring-2 inline-block hover:bg-purple-light dark:hover:bg-purple-off-black hover:text-white ${className}`}
      >
        <BiSearch size="1.375rem" className="inline" />{" "}
        <span className="hidden mx-1 text-base lg:inline">Search</span>
      </button>
      {isOpen &&
        createPortal(
          <DocSearchModal
            initialQuery={initialQuery}
            initialScrollY={window.scrollY}
            onClose={onClose}
            indexName="blitzjs"
            apiKey="c4db860ae4162be48d4c867e33edcaa2"
            appId="BH4D9OD16A"
            navigator={{
              navigate({itemUrl}) {
                setIsOpen(false)
                router.push(itemUrl)
              },
            }}
            hitComponent={Hit}
            transformItems={(items) => {
              return items.map((item) => {
                // We transform the absolute URL into a relative URL to
                // leverage Next's preloading.
                const a = document.createElement("a")
                a.href = item.url

                const hash = a.hash === "#content-wrapper" ? "" : a.hash

                // The titles are encoded, so we need to decode them.
                // &lt;Script&gt; --> <Script>
                const _highlightResult = {...item._highlightResult}

                _highlightResult.hierarchy.lvl0.value = _highlightResult.hierarchy.lvl0.value
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")

                return {
                  ...item,
                  _highlightResult,
                  url: `${a.pathname}${hash}`,
                }
              })
            }}
          />,
          document.body,
        )}
    </>
  )
}
