import { setupBlitz } from "@blitzjs/next";
import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth";
import { prisma as db } from "../prisma/index";

const { withBlitz, gSSP, api } = setupBlitz({
  plugins: [AuthServerPlugin({
    storage: PrismaStorage(db),
    isAuthorized() {
      console.log("isAuthorized");
      return false;
    }
  })]
})

export { withBlitz, gSSP, api }
