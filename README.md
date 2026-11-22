# Backend Engineer Coding Test

An authenticated GraphQL API built with Node.js and Apollo Server. It implements the supplied schema and uses the five supplied JSON files in `data/` as its datasource.

Last verified: November 22, 2026.

## Requirements

- Node.js 20 or newer
- npm

## Installation and startup

```bash
npm install
npm test
npm start
```

After startup, Apollo Sandbox is available at:

```text
http://localhost:4000/
```

## Authentication

All GraphQL requests, including schema introspection, require this HTTP header:

```text
Authorization: Bearer backend-coding-test-2026-R8m4K2v9
```

Submission token: **`backend-coding-test-2026-R8m4K2v9`**

The token can be overridden with the `API_TOKEN` environment variable. The server port can be overridden with `PORT`; it defaults to `4000`.

## Example query

```graphql
query GetNode {
  node(nodeId: "6297172e70a0c165b989cd10") {
    _id
    name
    parents {
      _id
      name
    }
    trigger {
      name
      resourceTemplate {
        name
      }
    }
    responses {
      name
    }
    actions {
      name
    }
  }
}
```

Expected result includes:

- Node: `User's Email`
- Parent: `Sign up Webinar`
- Trigger: `Email Trigger`
- Response: `Get Email Response`
- Action: `Send Email Action`

## Data mapping decisions

- Source node `parents` values are composite IDs. `parentIds` exposes those IDs, while `parents` resolves them through each node's `compositeId`.
- Node actions combine `preActions`, `actions`, and `postActions`, because the supplied GraphQL schema exposes a single `actions` field.
- `ResponseLocaleGroup.localeGroupId` maps from the source field `localeGroup`.
- Two supplied resource-template records omit the non-null `createdAt` required by the schema. Their existing `updatedAt` value is used as the timestamp fallback.

## Project structure

```text
data/               Supplied JSON datasource
src/auth.js          Bearer-token authentication
src/data.js          JSON loading and indexes
src/schema.js        GraphQL schema
src/resolvers.js     Scalars and relationship resolvers
src/server.js        Apollo Server factory
src/index.js         HTTP server entry point
test/                Automated tests
```

`node_modules/` is intentionally excluded from source control. Run `npm install` after cloning the repository.
