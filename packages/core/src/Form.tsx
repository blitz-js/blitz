import React from 'react';
import Router from 'next/router';

export default function({
  children,
  action,
  method,
  ...props
}: {
  [index: string]: any;
}) {
  const [i, setI] = React.useState(0);
  const [inProgress, setInProgress] = React.useState(false);

  React.useEffect(() => {
    // Warm the lamba
    // TODO: not sure if this is working correctly
    fetch(action, {method: 'HEAD'});
  }, []);

  return (
    <form
      onSubmit={async event => {
        event.preventDefault();

        setInProgress(true);

        const data = new URLSearchParams();
        for (const pair in new FormData(event.target as HTMLFormElement)) {
          // TODO properly handle file types here
          data.append(pair[0], pair[1] as string);
        }

        const res = await fetch(action, {
          method,
          body: data,
          headers: {
            Accept: 'application/json',
          },
        });

        setI(i + 1);

        if (res.ok && res.headers.get('Location')) {
          console.log(res.headers.get('Location'), res.headers.get('x-as'));
          if (res.headers.get('x-as')) {
            await Router.push(
              res.headers.get('Location') || '',
              res.headers.get('x-as') || '',
            );
          } else {
            await Router.push(res.headers.get('Location') || '');
          }
        }
        setInProgress(false);
      }}
      {...props}>
      <fieldset disabled={inProgress}>
        <React.Fragment key={i}>{children}</React.Fragment>
      </fieldset>
    </form>
  );
}
