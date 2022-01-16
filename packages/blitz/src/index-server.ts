export * from "./index-browser";

const crypto = require("crypto");

export const genKey = () => {
  console.log(crypto.randomBytes(32).toString("hex"));
};
