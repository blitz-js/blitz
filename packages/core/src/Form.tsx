import React from 'react'
import Router from 'next/router'

export default function({children, action, method, ...props}: {[index: string]: any}) {
  const [i, setI] = React.useState(0)
  const [inProgress, setInProgress] = React.useState(false)

  React.useEffect(() => {
    // Warm the lamba
    // TODO: not sure if this is working correctly
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

        for (const pair of new FormData(form).entries()) {
          console.log(pair[0], pair[1])
          data.append(pair[0], pair[1])
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
