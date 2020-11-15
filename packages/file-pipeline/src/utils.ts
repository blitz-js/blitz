import crypto from "crypto"
import File from "vinyl"
import {EventedFile, PipelineEvent} from "./types"

export function isFile(file: any): file is EventedFile {
  return File.isVinyl(file)
}

export function isEvent(file: any): file is PipelineEvent {
  return typeof file === "string"
}

export function hash(input: string) {
  return crypto.createHash("md5").update(input).digest("hex")
}
