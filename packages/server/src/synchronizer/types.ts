import File from 'vinyl'

// Rule functions transform the file stream
// If the function returns an array of files add those files to the stream
// If you return an empty array the input file will be deleted from the stream
export type Rule = (file: File, encoding?: string) => File | File[] | void
