export function PageHeader({title, align}) {
  if (!title) return null

  return (
    <div className="mb-5">
      <div className="flex items-center">
        <h1
          className={`w-full text-3xl lg:text-4xl xl:text-5xl font-semibold text-black dark:text-dark-mode-text font-primary text-${align}`}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}
