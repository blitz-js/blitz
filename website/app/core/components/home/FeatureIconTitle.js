import {Icon} from "@/components/home/Icon"

const FeatureIconTitle = ({icon, children, title}) => {
  return (
    <div className="xl:flex xl:flex-col xl:items-start xl:space-y-5">
      <Icon name={icon} variant="dark" />
      <h2 className="inline-block mt-0 mb-3 ml-2 text-lg font-semibold align-top xl:m-0 lg:align-bottom lg:text-xl">
        {title}
      </h2>
      <p className="text-sm text-transparent font-secondary lg:mt-2 bg-clip-text bg-gradient-to-r from-blue-gradient-white to-blue-gradient-light-blue">
        {children}
      </p>
    </div>
  )
}

export {FeatureIconTitle}
