import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { authenticateRequest } from "./auth.js";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";

export function createApolloServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: false,
  });
}

export async function startApiServer({ port = 4000 } = {}) {
  const server = createApolloServer();
  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => authenticateRequest(req),
  });

  return { server, url };
}
