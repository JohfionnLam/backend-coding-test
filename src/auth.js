import { GraphQLError } from "graphql";

export const DEFAULT_API_TOKEN = "backend-coding-test-2026-R8m4K2v9";

export function authenticateRequest(request) {
  const headers = request.headers;
  const headerValue = typeof headers.get === "function"
    ? headers.get("authorization")
    : headers.authorization ?? headers.Authorization;
  const authorization = Array.isArray(headerValue) ? headerValue[0] : headerValue ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const expectedToken = process.env.API_TOKEN || DEFAULT_API_TOKEN;

  if (!match || match[1] !== expectedToken) {
    throw new GraphQLError("Authentication required", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  return { authenticated: true };
}
