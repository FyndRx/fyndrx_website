import { getAccessToken, apiService as api, refreshAccessToken } from './api';
import serverConfig from '@/config/server';
import type { ChatConversation, ChatConversationList, ChatMessage } from '@/types/chat';

const SESSION_ID_KEY = 'fyndrx_chat_session_id';

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

/**
 * Guests only ever get one conversation (the backend `firstOrCreate`s by
 * session_id), so "new chat" for a guest means adopting a fresh session_id —
 * the old conversation still exists server-side, just no longer reachable
 * from this browser.
 */
function resetSessionId(): string {
  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_ID_KEY, id);
  return id;
}

export interface ChatStreamHandlers {
  onDelta: (delta: string) => void;
  onToolCall?: (toolName: string) => void;
  onComplete: (message: ChatMessage) => void;
}

class ChatStreamError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function buildHeaders(authenticated: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Version': serverConfig.version,
  };
  if (serverConfig.apiKey) {
    headers['X-API-Key'] = serverConfig.apiKey;
  }
  if (authenticated) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseErrorResponse(response: Response): Promise<ChatStreamError> {
  let message = `Request failed (${response.status})`;
  let data: any = null;
  try {
    data = await response.json();
    if (data?.message) message = data.message;
  } catch {
    // Non-JSON error body — fall back to the generic message above.
  }
  return new ChatStreamError(message, response.status, data);
}

/** Parses `event: ...\ndata: ...\n\n` SSE frames out of the response body as they arrive. */
async function consumeEventStream(response: Response, handlers: ChatStreamHandlers): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  while (!done) {
    const chunk = await reader.read();
    done = chunk.done;
    if (!chunk.value) continue;
    buffer += decoder.decode(chunk.value, { stream: true });

    let separatorIndex: number;
    while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawFrame = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      if (!rawFrame.trim()) continue;

      let eventName = 'message';
      const dataLines: string[] = [];
      for (const line of rawFrame.split('\n')) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }
      if (dataLines.length === 0) continue;

      let data: any;
      try {
        data = JSON.parse(dataLines.join(''));
      } catch {
        continue;
      }

      switch (eventName) {
        case 'text_delta':
          handlers.onDelta(data.delta ?? '');
          break;
        case 'tool_call':
          handlers.onToolCall?.(data.tool_name ?? '');
          break;
        case 'error':
          throw new ChatStreamError(data.message || 'Fynn ran into a problem generating that reply.');
        case 'message_complete':
          handlers.onComplete(data as ChatMessage);
          break;
      }
    }
  }
}

async function streamRequest(
  url: string,
  body: Record<string, unknown>,
  authenticated: boolean,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
  isRetryAfterRefresh = false
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(authenticated),
    body: JSON.stringify(body),
    signal,
  });

  if (response.status === 401 && authenticated && !isRetryAfterRefresh) {
    try {
      await refreshAccessToken();
    } catch (refreshError) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw refreshError;
    }
    return streamRequest(url, body, authenticated, handlers, signal, true);
  }

  if (!response.ok || !response.body) {
    throw await parseErrorResponse(response);
  }

  return consumeEventStream(response, handlers);
}

export const chatService = {
  getOrCreateSessionId,
  resetSessionId,

  /** The most recently active conversation for the signed-in user, or null if they have none yet. */
  async getLatestConversation(): Promise<ChatConversation | null> {
    const res = await api.getAuth<{ data: ChatConversation[] }>('/chat/conversations?per_page=1');
    return res.data[0] ?? null;
  },

  /** Paginated history of a signed-in user's conversations, most recently active first. */
  async listConversations(page = 1, perPage = 20): Promise<ChatConversationList> {
    return api.getAuth<ChatConversationList>('/chat/conversations', {
      params: { page, per_page: perPage },
    });
  },

  /**
   * Authenticated: always creates a brand-new conversation — only call this
   * when `getLatestConversation` came back empty.
   * Guest: idempotent — the backend `firstOrCreate`s by session_id, so this
   * safely returns the existing guest conversation if one already exists.
   */
  async createConversation(authenticated: boolean): Promise<ChatConversation> {
    if (authenticated) {
      const res = await api.postAuth<{ data: ChatConversation }>('/chat/conversations');
      return res.data;
    }
    const res = await api.post<{ data: ChatConversation }>('/chat/guest/conversations', {
      session_id: getOrCreateSessionId(),
    });
    return res.data;
  },

  async getConversation(id: string, authenticated: boolean): Promise<ChatConversation> {
    if (authenticated) {
      const res = await api.getAuth<{ data: ChatConversation }>(`/chat/conversations/${id}`);
      return res.data;
    }
    const res = await api.get<{ data: ChatConversation }>(`/chat/guest/conversations/${id}`, {
      params: { session_id: getOrCreateSessionId() },
    });
    return res.data;
  },

  /**
   * Streams the assistant's reply over SSE. Uses raw `fetch` rather than the
   * axios-based `apiService` — axios has no real browser streaming-body
   * support, and native `EventSource` can't send a POST body or a custom
   * Authorization header, both of which this endpoint needs.
   */
  async sendMessageStream(
    id: string,
    message: string,
    authenticated: boolean,
    handlers: ChatStreamHandlers,
    signal?: AbortSignal
  ): Promise<void> {
    if (authenticated) {
      return streamRequest(
        `${serverConfig.baseURL}/chat/conversations/${id}/messages`,
        { message },
        true,
        handlers,
        signal
      );
    }
    return streamRequest(
      `${serverConfig.baseURL}/chat/guest/conversations/${id}/messages`,
      { session_id: getOrCreateSessionId(), message },
      false,
      handlers,
      signal
    );
  },
};
