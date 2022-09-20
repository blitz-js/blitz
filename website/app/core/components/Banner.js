const Banner = ({message, hasLightBg, className = ""}) => (
  <div
    className={`border-b border-opacity-50 border-primary ${
      hasLightBg ? "text-black dark:text-dark-mode-text" : "text-white"
    } ${className}`}
  >
    <div className="font-semibold max-w-7xl mx-auto pt-1 pb-2 md:pt-0 md:pb-3 px-3 sm:px-6 lg:px-8 text-sm text-center">
      {message}
    </div>
  </div>
)

export default Banner
