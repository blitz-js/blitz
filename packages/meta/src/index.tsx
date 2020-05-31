import * as React from 'react'

const makeTitle = (title: string, name: string) => (title === name ? title : `${title} – ${name}`)

export const Meta = ({
  as: ElementType = React.Fragment,
  name = 'Blitz', // site name
  title = 'Blitz', // page title
  description,
  image,
  color = '#6700eb',
  manifest = 'https://raw.githubusercontent.com/blitz-js/blitz/canary/favicons/site.webmanifest',
}: {
  as?: any
  name?: string
  title?: string
  description?: string
  image?: string
  color?: string
  manifest?: string
}) => (
  <ElementType>
    <meta key="og_locale" property="og:locale" content="en_US" />
    <meta key="og_type" property="og:type" content="website" />
    <meta key="og_site" property="og:site_name" content={name} />
    <meta key="tw_site" name="twitter:site" content="@blitz_js" />
    <title key="title">{makeTitle(title, name)}</title>
    <meta key="og_title" property="og:title" content={makeTitle(title, name)} />
    <meta key="tw_title" name="twitter:title" content={makeTitle(title, name)} />
    {description && (
      <>
        <meta key="desc" name="description" content={description} />
        <meta key="og_desc" property="og:description" content={description} />
        <meta key="tw_desc" name="twitter:description" content={description} />
      </>
    )}
    {image && (
      <>
        <meta key="og_img" property="og:image" content={image} />
        <meta key="tw_card" name="twitter:card" content="summary_large_image" />
        <meta key="tw_img" name="twitter:image" content={image} />
      </>
    )}
    <meta key="theme_color" name="theme-color" content={color} />
    <meta key="tile_color" name="msapplication-TileColor" content={color} />
    <link
      key="safari_icon"
      rel="mask-icon"
      href="https://raw.githubusercontent.com/blitz-js/blitz/canary/favicons/safari-pinned-tab.svg"
      color={color}
    />
    <link
      key="apple_icon"
      rel="apple-touch-icon"
      sizes="180x180"
      href="https://raw.githubusercontent.com/blitz-js/blitz/canary/favicons/apple-touch-icon.png"
    />
    <link
      key="favicon_32"
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="https://raw.githubusercontent.com/blitz-js/blitz/canary/favicons/favicon-32x32.png"
    />
    <link
      key="favicon_16"
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="https://raw.githubusercontent.com/blitz-js/blitz/canary/favicons/favicon-16x16.png"
    />
    <link key="manifest" rel="manifest" href={manifest} />
  </ElementType>
)
