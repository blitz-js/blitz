import LogRocket from "logrocket"
import setupLogRocketReact from "logrocket-react"

const isActive = () =>
  process.env?.NEXT_PUBLIC_LOG_ROCKET_APP_ID &&
  process?.browser &&
  process.env.NODE_ENV === "production"

export const init = () => {
  if (isActive()) {
    LogRocket.init(process.env.NEXT_PUBLIC_LOG_ROCKET_APP_ID, {
      dom: {
        // Obfuscate all user inputs
        inputSanitizer: true,
      },
    })
    setupLogRocketReact(LogRocket)
  }
}

export const identify = (userId: string, sessionData = {}) => {
  if (isActive()) {
    LogRocket.identify(userId, sessionData)
  }
}
