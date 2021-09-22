import React from 'react'

export default class App extends React.Component {
  render() {
    const { Component, pageProps } = this.props

    return <Component {...pageProps} />
  }
}
