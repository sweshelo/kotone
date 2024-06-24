import { AnthropicToolDefinition, OpenAIToolDefinition, UnifiedToolDefinition } from "./types";

// Function to convert OpenAI tool definition to unified format
function convertOpenAIToUnified(openAITool: OpenAIToolDefinition): UnifiedToolDefinition {
  return {
    name: openAITool.function.name,
    description: openAITool.function.description,
    parameters: openAITool.function.parameters,
  };
}

// Function to convert Anthropic tool definition to unified format
function convertAnthropicToUnified(anthropicTool: AnthropicToolDefinition): UnifiedToolDefinition {
  return {
    name: anthropicTool.name,
    description: anthropicTool.description,
    parameters: anthropicTool.input_schema,
  };
}

// Function to convert unified format to OpenAI format
function convertUnifiedToOpenAI(unifiedTool: UnifiedToolDefinition): OpenAIToolDefinition {
  return {
    type: "function",
    function: {
      name: unifiedTool.name,
      description: unifiedTool.description,
      parameters: unifiedTool.parameters,
    },
  };
}

// Function to convert unified format to Anthropic format
function convertUnifiedToAnthropic(unifiedTool: UnifiedToolDefinition): AnthropicToolDefinition {
  return {
    name: unifiedTool.name,
    description: unifiedTool.description,
    input_schema: unifiedTool.parameters,
  };
}

export { convertUnifiedToAnthropic, convertUnifiedToOpenAI }