import * as Icons from 'heroicons-react'

export const colors = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink']

export const icons = Object.keys(Icons)
  .filter((icon) => icon.toLowerCase().indexOf('outline') > -1)
  .filter((icon) => icon.toLowerCase().indexOf('arrow') === -1)
  .filter((icon) => icon.toLowerCase().indexOf('caret') === -1)
  .filter((icon) => icon.toLowerCase().indexOf('menu') === -1)
