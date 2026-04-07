/**
 * Tool relations graph (PTS-03-01)
 *
 * Walks the ALL_TOOLS registry and builds a producer/consumer graph keyed
 * by relation key (e.g. "habit.completionRate"). Validates the graph for
 * cycles at module load — a cycle in tool data flow is a hard programming
 * error and must throw at boot, never at request time.
 */

import { ALL_TOOLS } from "./registry";
import type { ToolDefinition, ToolId } from "./types";

export type RelationKey = string;

export interface RelationNode {
  producers: ToolId[];
  consumers: ToolId[];
}

export type RelationGraph = Map<RelationKey, RelationNode>;

export function buildRelationGraph(
  tools: ToolDefinition[] = ALL_TOOLS
): RelationGraph {
  const graph: RelationGraph = new Map();

  const ensure = (key: RelationKey): RelationNode => {
    let node = graph.get(key);
    if (!node) {
      node = { producers: [], consumers: [] };
      graph.set(key, node);
    }
    return node;
  };

  for (const tool of tools) {
    for (const key of tool.produces ?? []) {
      const node = ensure(key);
      if (!node.producers.includes(tool.id)) {
        node.producers.push(tool.id);
      }
    }
    for (const key of tool.consumes ?? []) {
      const node = ensure(key);
      if (!node.consumers.includes(tool.id)) {
        node.consumers.push(tool.id);
      }
    }
  }

  return graph;
}

/**
 * Detect cycles in tool→tool flow induced by produces/consumes pairs.
 * A cycle exists when there is a path A → B → ... → A through the
 * "tool X produces a key that tool Y consumes" relation.
 *
 * Empty produces/consumes (the current stub state) cannot form cycles.
 */
export function validateNoCycles(graph: RelationGraph): void {
  // Build a tool→tool adjacency: producer -> [consumers...]
  const adjacency = new Map<ToolId, Set<ToolId>>();

  for (const node of graph.values()) {
    for (const producer of node.producers) {
      let edges = adjacency.get(producer);
      if (!edges) {
        edges = new Set();
        adjacency.set(producer, edges);
      }
      for (const consumer of node.consumers) {
        if (consumer !== producer) {
          edges.add(consumer);
        }
      }
    }
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<ToolId, number>();

  const dfs = (node: ToolId, path: ToolId[]): void => {
    color.set(node, GRAY);
    const next = adjacency.get(node);
    if (next) {
      for (const child of next) {
        const c = color.get(child) ?? WHITE;
        if (c === GRAY) {
          const cycle = [...path, node, child].join(" → ");
          throw new Error(
            `[relations] Cycle detected in tool relation graph: ${cycle}`
          );
        }
        if (c === WHITE) {
          dfs(child, [...path, node]);
        }
      }
    }
    color.set(node, BLACK);
  };

  for (const node of adjacency.keys()) {
    if ((color.get(node) ?? WHITE) === WHITE) {
      dfs(node, []);
    }
  }
}

// Build + validate at module load time. If a future tool stub introduces
// a cycle, the entire app fails fast on boot — never at request time.
const GRAPH: RelationGraph = buildRelationGraph();
validateNoCycles(GRAPH);

export function getRelationGraph(): RelationGraph {
  return GRAPH;
}

export function getProducersOf(key: RelationKey): ToolId[] {
  return GRAPH.get(key)?.producers ?? [];
}

export function getConsumersOf(key: RelationKey): ToolId[] {
  return GRAPH.get(key)?.consumers ?? [];
}
