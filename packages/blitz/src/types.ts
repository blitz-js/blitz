import {UrlObject} from "url"
// Context for plugins to declaration merge stuff into
export interface Ctx {}

export interface RouteUrlObject extends Pick<UrlObject, "pathname" | "query"> {
  pathname: string
}
