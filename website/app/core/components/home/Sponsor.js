import {Icon} from "@/components/home/Icon"

const Sponsor = ({title, iconName, children}) => {
  return (
    <div className="text-sm font-secondary">
      <Icon name={iconName} />
      <br className="hidden lg:block" />
      <h3 className="inline-block mb-3 ml-2 text-lg font-semibold align-top font-primary lg:ml-0 lg:mt-2 xl:text-xl">
        {title}
      </h3>
      <div className="flex space-x-2">{children}</div>
    </div>
  )
}

export {Sponsor}
