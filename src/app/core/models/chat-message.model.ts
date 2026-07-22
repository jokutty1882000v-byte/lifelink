export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatToolEvent {
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  toolName?: string;               // when role === 'tool'
  toolEvents?: ChatToolEvent[];    // rendered inline under the assistant reply
  streaming?: boolean;             // true while tokens are still arriving
  error?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}
