import { readFileSync } from "node:fs";

function loadJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));
}

export const data = {
  actions: loadJson("../data/action.json"),
  nodes: loadJson("../data/node.json"),
  resourceTemplates: loadJson("../data/resourceTemplate.json"),
  responses: loadJson("../data/response.json"),
  triggers: loadJson("../data/trigger.json"),
};

const byId = (items) => new Map(items.map((item) => [item._id, item]));

export const indexes = {
  actionsById: byId(data.actions),
  nodesById: byId(data.nodes),
  nodesByCompositeId: new Map(
    data.nodes.filter((node) => node.compositeId).map((node) => [node.compositeId, node]),
  ),
  resourceTemplatesById: byId(data.resourceTemplates),
  responsesById: byId(data.responses),
  triggersById: byId(data.triggers),
};
