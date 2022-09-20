import React from "react"
import {BsArrowRight} from "react-icons/bs"

const ButtonLink = React.forwardRef(({className, children, variant = "solid", ...props}, ref) => {
  let classes = "flex items-center justify-center py-2 px-3 lg:px-5 font-secondary font-bold"

  if (!className.includes("text-")) {
    classes += " text-base"
  }

  switch (variant) {
    case "solid":
      classes +=
        " bg-white text-off-black hover:bg-gradient-to-r from-blue-gradient-white to-blue-gradient-light-blue"
      break
    case "solid-dark":
      classes +=
        " bg-purple-light dark:bg-purple-primary text-white hover:bg-purple-mid dark:hover:bg-purple-dark"
      break
    case "outline":
      classes +=
        " border border-white text-white hover:bg-purple-primary dark:hover:bg-purple-off-black"
      break
    default:
      throw new Error("Invalid variant value: " + variant)
  }

  return (
    <a className={`${classes} ${className}`} {...props} ref={ref}>
      {children} <BsArrowRight size="1.5rem" className="ml-2" />
    </a>
  )
})

export {ButtonLink}
