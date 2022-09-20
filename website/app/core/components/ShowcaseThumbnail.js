import {Image} from "blitz"

export function ShowcaseThumbnail({title, thumbnail, URL}) {
  return (
    <a href={URL} rel="noreferrer" target="_blank" className="overflow-visible">
      <div className="showcase-block">
        <Image
          src={thumbnail}
          className="showcase-block-image overflow-visible"
          alt={title}
          width={756}
          height={402}
          layout="responsive"
        />
        <h4 className="showcase-block-title font-primary text-sm lg:text-md xl:text-lg text-gray-600 dark:text-gray-300 font-semibold my-1 mt-2">
          {title}
        </h4>
      </div>
    </a>
  )
}
