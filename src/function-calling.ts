import OpenAI from "openai";
import "dotenv/config";
import { ChatCompletionMessageParam } from "openai/resources";

export async function* main(messages: ChatCompletionMessageParam[]) {
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "search_web",
        description: "Search on the Web",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Compose query for search with space-separated words",
            },
          },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
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
          require: ["urls"],
        },
      },
    },
    {
      type: "function",
      function: {
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
          require: ["prompt"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "escalation_intelligent_model",
        description:
          "Attempt to generate responses using the latest models to generate better quality responses",
      },
    },
  ] as const;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    tools,
    stream: true,
  });

  let toolCallsDetected = false;
  let toolCallsParams: { name: string; arguments: string }[] = [];
  let isHeaderReturned = false;

  for await (const message of chat) {
    const delta = message.choices[0].delta;

    if (
      "tool_calls" in delta &&
      Array.isArray(delta.tool_calls) &&
      delta.tool_calls.length > 0
    ) {
      toolCallsDetected = true;
      delta.tool_calls.forEach((call) => {
        const index = call.index;
        const functionName = call.function?.name ?? "UNKNOWN";
        const functionArguments = call.function?.arguments ?? "";

        if (!toolCallsParams[index]) {
          toolCallsParams[index] = { name: functionName, arguments: "" };
        }
        toolCallsParams[index].arguments += functionArguments;
      });

      if (!isHeaderReturned){
        yield "TOOL_CALLS";
        isHeaderReturned = true
      }
    } else {
      if (!isHeaderReturned){
        yield "NORMAL";
        isHeaderReturned = true
      }
    }

    if (!toolCallsDetected) {
      if (delta.content) {
        yield delta.content;
      }
    }
  }

  if (toolCallsDetected) {
    yield toolCallsParams;
  }
}

