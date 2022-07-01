import {prisma} from "./index"

const seed = async () => {
  await prisma.$reset()
}

export default seed
