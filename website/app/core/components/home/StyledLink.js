import React from "react"

const StyledLink = React.forwardRef(({href, children, className, ...props}, ref) => {
  return (
    <a href={href} {...props} className={`hover:text-blue-mid ${className}`} ref={ref}>
      {children}
    </a>
  )
})

export {StyledLink}
