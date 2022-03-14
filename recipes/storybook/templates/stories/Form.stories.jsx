import {Form} from "../core/components/Form"
import {Link} from "blitz"
import {LabeledTextField} from "../core/components/LabeledTextField"
export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Core/Form",
  component: Form,
}

const Template = (args) => <Form {...args} />

export const LoginForm = Template.bind({})
LoginForm.args = {
  children: (
    <>
      <LabeledTextField name="email" label="Email" placeholder="Email" />
      <LabeledTextField name="password" label="Password" placeholder="Password" type="password" />
      <div>
        <Link href={"#"}>
          <a>Forgot your password?</a>
        </Link>
      </div>
      <div style={{marginTop: "1rem"}}>
        Or <Link href={"#"}>Sign Up</Link>
      </div>
    </>
  ),
}

export const SignUpForm = Template.bind({})
SignUpForm.args = {
  children: (
    <>
      <LabeledTextField name="email" label="Email" placeholder="Email" />
      <LabeledTextField name="password" label="Password" placeholder="Password" type="password" />
    </>
  ),
}
