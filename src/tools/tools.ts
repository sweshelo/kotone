import { UnifiedToolDefinition } from "./types";

export const tools: UnifiedToolDefinition[] = [
  {
    name: "search_web",
    description: "Search on the Web",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Compose query for search with space-separated words",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "fetch_url",
    description: "Access the URL in the prompt",
    parameters: {
      type: "object",
      properties: {
        urls: {
          type: "array",
          items: { type: "string" },
          description: "URLs array included in the prompt",
        },
      },
      required: ["urls"],
    },
  },
  {
    name: "generate_image",
    description: "Generate image",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "If a specific drawing prompt is specified, excerpt it. Otherwise, return a new prompt for drawing.",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "escalation_intelligent_model",
    description:
      "Attempt to generate responses using the latest models to generate better quality responses",
  },
] as const;
