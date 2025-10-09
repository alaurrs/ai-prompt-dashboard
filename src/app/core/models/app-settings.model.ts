import {ProviderSettings} from './provided-settings.model';

export interface AppSettings {
  providers: ProviderSettings[];
  theme?: 'light' | 'dark' | 'auto';
}
