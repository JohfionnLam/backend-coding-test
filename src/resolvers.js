import { GraphQLScalarType, Kind } from "graphql";
import { indexes } from "./data.js";

function parseJsonLiteral(ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return ast.values.map((value) => parseJsonLiteral(value, variables));
    case Kind.OBJECT:
      return Object.fromEntries(
        ast.fields.map((field) => [field.name.value, parseJsonLiteral(field.value, variables)]),
      );
    case Kind.VARIABLE:
      return variables?.[ast.name.value];
    default:
      return undefined;
  }
}

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "An arbitrary JSON value",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: parseJsonLiteral,
});

function coerceLong(value) {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new TypeError("Long must be a safe integer");
  }
  return number;
}

const LongScalar = new GraphQLScalarType({
  name: "Long",
  description: "A signed integer represented as a JavaScript safe integer",
  serialize: coerceLong,
  parseValue: coerceLong,
  parseLiteral(ast) {
    if (ast.kind !== Kind.INT && ast.kind !== Kind.STRING) {
      throw new TypeError("Long must be an integer");
    }
    return coerceLong(ast.value);
  },
});

const actionIdsForNode = (node) => [
  ...(node.preActions ?? []),
  ...(node.actions ?? []),
  ...(node.postActions ?? []),
].filter((id, index, ids) => ids.indexOf(id) === index);

const resolveResourceTemplate = (item) =>
  item.resourceTemplateId
    ? indexes.resourceTemplatesById.get(item.resourceTemplateId) ?? null
    : null;

export const resolvers = {
  JSON: JSONScalar,
  Long: LongScalar,
  Query: {
    node: (_parent, { nodeId }) =>
      nodeId ? indexes.nodesById.get(nodeId) ?? null : null,
  },
  Action: {
    resourceTemplate: resolveResourceTemplate,
  },
  Trigger: {
    resourceTemplate: resolveResourceTemplate,
  },
  ResourceTemplate: {
    // Two supplied records omit createdAt; updatedAt is the only source timestamp.
    createdAt: (template) => template.createdAt ?? template.updatedAt,
  },
  ResponseLocaleGroup: {
    localeGroupId: (localeGroup) =>
      localeGroup.localeGroupId ?? localeGroup.localeGroup ?? null,
  },
  NodeObject: {
    parentIds: (node) => node.parents ?? [],
    parents: (node) =>
      (node.parents ?? [])
        .map((id) => indexes.nodesByCompositeId.get(id))
        .filter(Boolean),
    triggerId: (node) => node.trigger ?? null,
    trigger: (node) =>
      node.trigger ? indexes.triggersById.get(node.trigger) ?? null : null,
    responseIds: (node) => node.responses ?? [],
    responses: (node) =>
      (node.responses ?? [])
        .map((id) => indexes.responsesById.get(id))
        .filter(Boolean),
    actionIds: actionIdsForNode,
    actions: (node) =>
      actionIdsForNode(node)
        .map((id) => indexes.actionsById.get(id))
        .filter(Boolean),
  },
};
