import {Icon} from "@/components/home/Icon"

const FeatureIcon = ({icon, children}) => {
  return (
    <div className="space-y-4">
      <Icon name={icon} variant="dark" />
      <p className="text-base lg:text-lg">{children}</p>
    </div>
  )
}

export {FeatureIcon}
