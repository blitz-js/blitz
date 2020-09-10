import {DefaultAuthTypes} from "blitz"
import {User} from "db"

declare module "blitz" {
  export interface AuthTypes extends DefaultAuthTypes {
    userId: User["id"]
  }
}
