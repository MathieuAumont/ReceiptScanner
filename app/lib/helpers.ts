import { Platform } from 'react-native';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function encodeBase64(str: string): string {
  if (Platform.OS === 'web') {
    return btoa(str);
  } else {
    // Convertir la chaîne en tableau d'octets
    const data = new TextEncoder().encode(str);
    // Convertir en base64
    return btoa(String.fromCharCode(...data));
  }
}

export function decodeBase64(str: string): string {
  if (Platform.OS === 'web') {
    return atob(str);
  } else {
    // Décoder de base64
    const binaryStr = atob(str);
    // Convertir en tableau d'octets
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    // Convertir en chaîne
    return new TextDecoder().decode(bytes);
  }
}

// Export par défaut vide pour éviter l'erreur de route
export default {}; 