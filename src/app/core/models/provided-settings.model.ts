export interface ProviderSettings {
  id: 'mock' | 'openai' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  models?: string[];
}
