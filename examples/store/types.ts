export {}

// This should not be needed. Usually it isn't but for some reason in this example it is
declare module "react" {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}
