import {forwardRef, useMemo} from "react"

import {Code} from "@/components/Code"

import styles from "./CodeWindow.module.css"

export function CodeWindow({
  children,
  lineNumbersBackground = true,
  className = "",
  tabs,
  onTabClick,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-2xl flex ${styles.root} ${className}`}
    >
      <div className="absolute inset-0 bg-white dark:bg-purple-off-black" />
      <div className="relative flex flex-col w-full">
        <div className="flex items-center flex-none px-4 bg-gray-200 h-9 dark:bg-transparent">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 bg-green-400 rounded-full" />
          </div>
          <div className="file-bar flex self-end h-full pt-2 overflow-x-scroll hide-scrollbar">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => onTabClick(i)}
                className={`px-4 ml-3 text-xs text-black dark:text-dark-mode-text rounded-t-lg font-mono ${
                  tab.selected
                    ? "bg-gray-50 dark:bg-purple-mid"
                    : "bg-gray-300 dark:bg-purple-extradark"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col flex-auto min-h-0 border-t border-gray-200 dark:border-gray-800">
          {lineNumbersBackground && (
            <div className="absolute inset-y-0 left-0 hidden md:block" style={{width: 50}} />
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

CodeWindow.Code = forwardRef(({tokens, initialLineNumber = 1, ...props}, ref) => {
  const lineNumbers = useMemo(() => {
    const t = tokens.flat(Infinity)
    let line = initialLineNumber + 1
    let str = `${initialLineNumber}\n`
    for (let i = 0; i < t.length; i++) {
      if (typeof t[i] === "string") {
        const newLineChars = t[i].match(/\n/g)
        if (newLineChars !== null) {
          for (let j = 0; j < newLineChars.length; j++) {
            str += `${line++}\n`
          }
        }
      }
    }
    return str
  }, [tokens, initialLineNumber])

  return (
    <div className="flex flex-auto w-full min-h-0 overflow-auto">
      <div ref={ref} className="relative flex-auto w-full">
        <pre className="flex min-h-full text-xs">
          <div
            aria-hidden="true"
            className="flex-none hidden py-4 pr-4 font-mono text-right text-black text-opacity-50 select-none dark:text-dark-mode-text md:block"
            style={{width: 50}}
          >
            {lineNumbers}
          </div>
          <code className="relative flex-auto block px-4 pt-4 pb-4 overflow-auto font-mono text-black dark:text-dark-mode-text text-xs">
            <Code tokens={tokens} {...props} />
          </code>
        </pre>
      </div>
    </div>
  )
})

export function getClassNameForToken({types, empty}) {
  const typesSize = types.length
  if (typesSize === 1 && types[0] === "plain") {
    return empty ? "inline-block" : undefined
  }
  return (types[typesSize - 1] + (empty ? " inline-block" : " token")).trim()
}
