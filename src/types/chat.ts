export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';
export type ChatTier = 'anonymous' | 'authenticated';

export interface ChatSuggestion {
  pharmacy_drug_price_id: string;
  quantity: number;
  product_name: string;
  pharmacy_name: string;
  branch_name?: string;
  price: number;
  effective_price: number;
  in_stock: boolean;
  requires_prescription: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string | null;
  suggestions: ChatSuggestion[] | null;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string | null;
  tier: ChatTier;
  last_message_at: string | null;
  created_at: string;
  messages?: ChatMessage[];
}

export interface ChatConversationListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface ChatConversationList {
  data: ChatConversation[];
  meta: ChatConversationListMeta;
}
