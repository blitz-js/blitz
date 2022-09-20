const LinkList = ({title, className = "", children}) => {
  return (
    <div className={`text-sm space-y-2 flex flex-col font-secondary ${className}`}>
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  )
}

export {LinkList}
