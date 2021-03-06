# Circular structure in "getInitialProps" result

#### Why This Error Occurred

`getInitialProps` is serialized to JSON using `JSON.stringify` and sent to the client side for hydrating the page.

However, the result returned from `getInitialProps` can't be serialized when it has a circular structure.

#### Possible Ways to Fix It

Circular structures are not supported, so the way to fix this error is removing the circular structure from the object that is returned from `getInitialProps`.
