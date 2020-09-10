import {DefaultUserIdType} from "blitz"

// type UserIdType = number

declare module "blitz" {
  export interface MyUserIdType extends DefaultUserIdType {
    id: number
  }
  // export type MyUserIdType = number
}
