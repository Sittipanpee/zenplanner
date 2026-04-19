/**
 * Tool registry — single source of truth for all enabled productivity tools.
 *
 * Wave-1 agents: when you replace a stub in `_all.ts` with a real
 * implementation, no change is needed here. The registry rebuilds from
 * `_all.ts` automatically.
 */

import type { ToolDefinition, ToolId } from "./types";
import { ALL_STUBS, SYNTHETIC_TOOL_IDS } from "./_all";

/**
 * ALL_TOOLS includes every registered definition (including synthetic ones
 * used as backing storage for non-widget features). For UI surfaces that
 * show a "tool catalog" to the user, use `CATALOG_TOOLS` which filters
 * out synthetic tools.
 */
export const ALL_TOOLS: ToolDefinition[] = ALL_STUBS;

/** Tools that are visible in the catalog / recommendations / dashboard. */
export const CATALOG_TOOLS: ToolDefinition[] = ALL_STUBS.filter(
  (t) => !SYNTHETIC_TOOL_IDS.has(t.id)
);

const TOOLS_BY_ID: Map<ToolId, ToolDefinition> = new Map(
  ALL_TOOLS.map((tool) => [tool.id, tool])
);

export function getToolById(id: ToolId): ToolDefinition | undefined {
  return TOOLS_BY_ID.get(id);
}

export function getToolByIdString(id: string): ToolDefinition | undefined {
  return TOOLS_BY_ID.get(id as ToolId);
}

/** All tools in a given category. */
export function getToolsByCategory(category: ToolDefinition["category"]): ToolDefinition[] {
  return ALL_TOOLS.filter((t) => t.category === category);
}

/**
 * Strip non-serializable fields (Widget, schema, excel) so the
 * definition can be sent over the wire from /api/tools/catalog.
 */
export type SerializableToolDefinition = Omit<
  ToolDefinition,
  "Widget" | "schema" | "excel" | "icon"
> & { iconName: string };

export function toSerializable(tool: ToolDefinition): SerializableToolDefinition {
  // Lucide icons expose `displayName`; fall back to id when missing.
  // Defensive: if a tool was authored without an icon, fall back gracefully
  // so the entire catalog endpoint doesn't crash on a single bad tool.
  const iconWithName = (tool.icon ?? {}) as unknown as { displayName?: string; name?: string };
  const iconName = iconWithName.displayName ?? iconWithName.name ?? tool.id;
  return {
    id: tool.id,
    category: tool.category,
    name: tool.name,
    description: tool.description,
    color: tool.color,
    recommendedFor: tool.recommendedFor,
    recommendationReason: tool.recommendationReason,
    defaultConfig: tool.defaultConfig,
    produces: tool.produces,
    consumes: tool.consumes,
    iconName,
  };
}
