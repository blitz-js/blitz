/* NOTE: Run `yarn dev` and visit http://localhost:3000/api/graphql to view
 * the graphql playground. Try registering a new User account and then querying
 * for it with the following query:
 *
 * query {
 *   allUsers {
 *     id
 *     email
 *     role
 *   }
 * }
 */

import db from "db"
import "reflect-metadata"
import {ObjectType, Resolver, Query, Field, buildSchemaSync} from "type-graphql"
import {ApolloServer} from "apollo-server-micro"

@ObjectType()
export class User {
  @Field(() => Number)
  id: Number
  @Field(() => String, {nullable: true})
  email: string
  @Field(() => String)
  role: string
}
@Resolver(User)
export class UserResolver {
  @Query(() => [User], {nullable: true})
  async allUsers() {
    const users = await db.user.findMany()
    console.log(users)
    return users
  }
}
const schema = buildSchemaSync({
  resolvers: [UserResolver],
})

const apolloServer = new ApolloServer({schema})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({path: "/api/graphql"})
