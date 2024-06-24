// Common interfaces
interface BaseToolDefinition {
  name: string;
  description: string;
}

interface ParameterDefinition {
  type: string;
  description?: string;
  enum?: string[];
  items?: {
    type: string;
    enum?: string[];
  };
  properties?: Record<string, ParameterDefinition>;
  required?: string[];
}

// OpenAI specific interfaces
interface OpenAIFunctionDefinition extends BaseToolDefinition {
  parameters?: {
    type: "object";
    properties: Record<string, ParameterDefinition>;
    required?: string[];
  };
}

interface OpenAIToolDefinition {
  type: "function";
  function: OpenAIFunctionDefinition;
}

// Anthropic specific interfaces
interface AnthropicToolDefinition extends BaseToolDefinition {
  input_schema?: {
    type: "object";
    properties: Record<string, ParameterDefinition>;
    required?: string[];
  };
}

// Unified Tool Definition
interface UnifiedToolDefinition extends BaseToolDefinition {
  parameters?: {
    type: "object";
    properties: Record<string, ParameterDefinition>;
    required?: string[];
  };
}

export { OpenAIFunctionDefinition, OpenAIToolDefinition, AnthropicToolDefinition, UnifiedToolDefinition };