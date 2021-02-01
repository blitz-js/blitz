import {Logger} from "tslog"

export const logger = new Logger({
  type: "pretty",
  dateTimePattern: "hour:minute:second.millisecond",
  displayFunctionName: false,
  displayFilePath: "hidden",
  dateTimeTimezone:
    process.env.NODE_ENV === "production"
      ? "utc"
      : Intl.DateTimeFormat().resolvedOptions().timeZone,
  prettyInspectHighlightStyles: {name: "yellow", number: "blue", bigint: "blue", boolean: "blue"},
  maskValuesOfKeys: ["password", "passwordConfirmation"],
  exposeErrorCodeFrame: process.env.NODE_ENV !== "production",
})
