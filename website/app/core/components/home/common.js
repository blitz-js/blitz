import {Link as BlitzLink} from "blitz"

export function IconContainer({as: Component = "div", color, className = "", ...props}) {
  return (
    <Component
      className={`w-12 h-12 rounded-xl mb-8 bg-gradient-to-br flex items-center justify-center ${className}`}
      {...props}
    />
  )
}

export function Caption({as: Component = "p", className = "", ...props}) {
  return (
    <Component
      className={`sm:text-lg sm:leading-snug font-semibold tracking-wide uppercase ${className}`}
      {...props}
    />
  )
}

export function BigText({as: Component = "p", className = "", ...props}) {
  return (
    <Component
      className={`text-3xl sm:text-5xl lg:text-6xl leading-none font-extrabold text-gray-900 tracking-tight ${className}`}
      {...props}
    />
  )
}

export function Paragraph({as: Component = "p", className = "", ...props}) {
  return (
    <Component
      className={`max-w-4xl text-lg sm:text-2xl font-medium sm:leading-10 space-y-6 ${className}`}
      {...props}
    />
  )
}

export function Link({className = "", href, ...props}) {
  return (
    <BlitzLink href={href}>
      {/* eslint-disable-next-line */}
      <a
        className={`inline-flex text-lg sm:text-2xl font-medium transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-current focus:outline-none rounded-md ${className}`}
        {...props}
      />
    </BlitzLink>
  )
}

export function InlineCode({className = "", ...props}) {
  return <code className={`font-mono text-gray-900 font-bold ${className}`} {...props} />
}
