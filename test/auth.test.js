import assert from "node:assert/strict";
import test from "node:test";
import { authenticateRequest, DEFAULT_API_TOKEN } from "../src/auth.js";

test("accepts the documented Bearer token", () => {
  const request = new Request("http://localhost/graphql", {
    headers: { authorization: `Bearer ${DEFAULT_API_TOKEN}` },
  });
  assert.deepEqual(authenticateRequest(request), { authenticated: true });
});

test("accepts Node.js IncomingMessage-style headers", () => {
  const request = {
    headers: { authorization: `Bearer ${DEFAULT_API_TOKEN}` },
  };
  assert.deepEqual(authenticateRequest(request), { authenticated: true });
});

test("rejects missing and invalid credentials", () => {
  const missing = new Request("http://localhost/graphql");
  const invalid = new Request("http://localhost/graphql", {
    headers: { authorization: "Bearer incorrect" },
  });

  for (const request of [missing, invalid]) {
    assert.throws(
      () => authenticateRequest(request),
      (error) => error.extensions?.code === "UNAUTHENTICATED",
    );
  }
});
