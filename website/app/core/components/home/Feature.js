const Feature = ({title, children, className = ""}) => {
  return (
    <div className={`text-sm font-secondary ${className} max-w-[35rem]`}>
      <h3 className="mb-5 text-2xl font-semibold lg:font-primary">{title}</h3>
      <div className="mr-6 space-y-4 dark:text-blue-light">{children}</div>
    </div>
  )
}

export {Feature}
