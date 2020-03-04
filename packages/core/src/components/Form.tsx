import Router from 'next/router'
import React from 'react'

export default function({children, action, method, ...props}: {[index: string]: any}) {
  const [i, setI] = React.useState(0)
  const [inProgress, setInProgress] = React.useState(false)

  React.useEffect(() => {
    // Warm the lamba
    // TODO: Only do this once per route
    fetch(action, {method: 'HEAD'})
  }, [])

  return (
    <form
      onSubmit={async event => {
        setInProgress(true)

        event.preventDefault()

        const form = event.target as HTMLFormElement
        const data = new URLSearchParams()

        for (const [key, value] of new FormData(form).entries()) {
          data.append(key, value.toString())
        }

        const res = await fetch(action, {
          method,
          body: data,
          headers: {
            Accept: 'application/json',
          },
        })

        setI(i + 1)

        if (res.ok && res.headers.get('Location')) {
          console.log(res.headers.get('Location'), res.headers.get('x-as'))
          if (res.headers.get('x-as')) {
            await Router.push(res.headers.get('Location') || '', res.headers.get('x-as') || '')
          } else {
            await Router.push(res.headers.get('Location') || '')
          }
        }
        setInProgress(false)
      }}
      {...props}>
      <fieldset disabled={inProgress}>
        <React.Fragment key={i}>{children}</React.Fragment>
      </fieldset>
    </form>
  )
}
