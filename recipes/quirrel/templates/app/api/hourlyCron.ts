import { CronJob } from "quirrel/blitz"

export default CronJob(
  "api/hourlyCron", // the path of this API route
  "@hourly", // cron schedule (see https://crontab.guru)
  async () => {
    console.log("A new hour has begun!")
  }
)
