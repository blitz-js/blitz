import React, { Component } from 'react'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mounted: false,
    }
  }

  componentDidMount() {
    this.setState({ mounted: true })
  }

  render() {
    return (
      <p>
        ComponentDidMount{' '}
        {this.state.mounted ? 'executed on client' : 'not executed'}.
      </p>
    )
  }
}
