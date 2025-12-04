interface ServerConfig {
  baseURL: string;
  timeout: number;
  version: string;
  apiKey?: string;
}

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL environment variable is not set. Please check your .env.development file.');
}

const config: ServerConfig = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 30 seconds
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiKey: import.meta.env.VITE_API_KEY,
};

export default config;
