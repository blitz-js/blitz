import {Icon} from "@/components/home/Icon"

const FeatureIcon = ({icon, children, heading}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Icon name={icon} variant="dark" />
        <h3 className="text-xl font-semibold">{heading}</h3>
      </div>
      <p className="text-left text-transparent bg-clip-text bg-gradient-to-r from-blue-gradient-white to-blue-gradient-light-blue">
        {children}
      </p>
    </div>
  )
}

export {FeatureIcon}
