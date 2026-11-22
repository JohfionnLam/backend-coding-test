import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_API_TOKEN } from "../src/auth.js";
import { createApolloServer, startApiServer } from "../src/server.js";

test("resolves a node and all related JSON records", async (t) => {
  const server = createApolloServer();
  await server.start();
  t.after(() => server.stop());

  const result = await server.executeOperation({
    query: `
      query Node($nodeId: ID) {
        node(nodeId: $nodeId) {
          _id
          name
          parentIds
          parents { name }
          triggerId
          trigger { name resourceTemplate { name createdAt } }
          responseIds
          responses {
            name
            platforms { localeGroups { localeGroupId } }
          }
          actionIds
          actions { name resourceTemplate { name createdAt } }
        }
      }
    `,
    variables: { nodeId: "6297172e70a0c165b989cd10" },
  });

  assert.equal(result.body.kind, "single");
  assert.equal(result.body.singleResult.errors, undefined);
  const node = result.body.singleResult.data.node;
  assert.equal(node.name, "User's Email");
  assert.deepEqual(node.parentIds, ["rCMUtmL3aOULyqBL"]);
  assert.equal(node.parents[0].name, "Sign up Webinar");
  assert.equal(node.trigger.name, "Email Trigger");
  assert.equal(node.trigger.resourceTemplate.name, "Predefined Triggers");
  assert.deepEqual(node.responseIds, ["6297189510f525833b1a9305"]);
  assert.equal(node.responses[0].platforms[0].localeGroups[0].localeGroupId, "default");
  assert.deepEqual(node.actionIds, ["6530933e6a1690d2f0c78a92"]);
  assert.equal(node.actions[0].resourceTemplate.name, "Send Email");
});

test("returns null for a missing or unknown id", async (t) => {
  const server = createApolloServer();
  await server.start();
  t.after(() => server.stop());

  for (const variables of [{}, { nodeId: "does-not-exist" }]) {
    const result = await server.executeOperation({
      query: "query Node($nodeId: ID) { node(nodeId: $nodeId) { _id } }",
      variables,
    });
    assert.equal(result.body.singleResult.data.node, null);
  }
});

test("enforces Bearer authentication over HTTP", async (t) => {
  const { server, url } = await startApiServer({ port: 0 });
  t.after(() => server.stop());

  const request = (authorization) =>
    fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(authorization ? { authorization } : {}),
      },
      body: JSON.stringify({
        query: "query { __schema { queryType { name } } }",
      }),
    });

  for (const authorization of [undefined, "Bearer incorrect"]) {
    const response = await request(authorization);
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.errors[0].extensions.code, "UNAUTHENTICATED");
    assert.equal(body.errors[0].extensions.stacktrace, undefined);
  }

  const response = await request(
    `Bearer ${process.env.API_TOKEN || DEFAULT_API_TOKEN}`,
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.errors, undefined);
  assert.equal(body.data.__schema.queryType.name, "Query");
});
