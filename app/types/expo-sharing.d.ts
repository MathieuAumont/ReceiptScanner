declare module 'expo-sharing' {
  export function shareAsync(url: string, options?: {
    mimeType?: string;
    dialogTitle?: string;
    UTI?: string;
  }): Promise<void>;
  
  export function isAvailableAsync(): Promise<boolean>;
} 