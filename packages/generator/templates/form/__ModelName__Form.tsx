import React from 'react'

type __ModelName__FormProps = {
  initialValues: any
  onSubmit: () => any
}

const __ModelName__Form: React.FC<__ModelName__FormProps> = ({initialValues, onSubmit}) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}>
      <div>Put your form fields here. But for now, just click submit</div>
      <div>{JSON.stringify(initialValues)}</div>
      <button>Submit</button>
    </form>
  )
}

export default __ModelName__Form
