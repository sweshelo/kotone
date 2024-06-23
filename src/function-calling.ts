import OpenAI from "openai";
import "dotenv/config";
import { ChatCompletionMessageParam } from "openai/resources";
import { fetchUrl } from "./scrape";
import { googleSearch } from "./google";

export type AiResponseChunk = {
  type: "chunk" | "guide";
  value: string;
};

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
    /*
    {
      type: "function",
      function: {
        name: "escalation_intelligent_model",
        description:
          "Attempt to generate responses using the latest models to generate better quality responses",
      },
    },
    */
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

  type Source = {
    url: string;
    docs: string;
  };

  let toolCallsDetected = false;
  let toolCallsParams: { name: string; arguments: string }[] = [];
  let docs: Source[] = [];

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
    }

    if (!toolCallsDetected) {
      if (delta.content) {
        yield {
          type: "chunk",
          value: delta.content,
        };
      }
    }
  }

  if (toolCallsDetected) {
    let urls: string[] = [];
    for (const tool of toolCallsParams) {
      const args = JSON.parse(tool.arguments);
      switch (tool.name) {
        case "search_web":
          yield {
            type: "guide",
            value: `! Google investigating on ${args.query}\n`,
          };
          urls = await googleSearch(args.query);
          yield {
            type: "guide",
            value: `! Google Complete.`,
          };
        case "fetch_url":
          for await (const url of urls.concat(args.urls).filter(e => e)) {
            yield {
              type: "guide",
              value: `! Fetching ${url} ...\n`,
            };
            docs.push(await fetchUrl(url));
            yield {
              type: "guide",
              value: `! Fetch Complete.`,
            };
          }
          break;
        case "escalation_intelligent_model":
          yield {
            type: "guide",
            value: `! GPT-4o will respond.\n`,
          };
          break;
        case "generate_image":
          yield {
            type: "guide",
            value: `画像の生成が要求されました。現時点では画像の生成は非対応ですが、GPTは次の内容で画像を生成するように解釈しました。プロンプト: ${args.prompt}`,
          };
          return;
        case "UNKNOWN":
        default:
          yield {
            type: "guide",
            value: `! Error! The specified tool could not be found or is currently unavailable.\n`,
          };
          console.log(`Error: ${tool.name} called - ${tool.arguments}`);
          break;
      }
    }

    console.log("Calling GPT-4o");
    try {
      const chat = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...messages,
          {
            role: "system",
            content: `Web検索結果: ${docs
              .map((s) => `source: ${s.url}\ncontents: ${s.docs}`)
              .join()}`,
          },
        ],
        stream: true,
      });

      for await (const message of chat) {
        const delta = message.choices[0].delta;
        if (delta.content) {
          yield {
            type: "chunk",
            value: delta.content,
          };
        }
      }
    } catch (e) {
      yield {
        type: "guide",
        value: `エラーが発生しました。 ${(e as Error).message}`,
      };
    }
  }
}
