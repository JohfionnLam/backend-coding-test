import { startApiServer } from "./server.js";

const port = Number(process.env.PORT || 4000);
const { url } = await startApiServer({ port });

console.log(`GraphQL API ready at ${url}`);
