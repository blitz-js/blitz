declare module "vinyl-file" {
  import File from "vinyl"

  type Options = {
    cwd?: string
    base?: string
    read?: boolean
    buffer?: boolean
  }
  export function read(pth: string, opts?: Options): Promise<File>
  export function readSync(pth: string, opts?: Options): File
}
