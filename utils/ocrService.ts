import * as vision from '@google-cloud/vision';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface ReceiptData {
  store?: string;
  total?: number;
  date?: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
}

export class OCRService {
  private client: vision.ImageAnnotatorClient;
  
  constructor(credentials: string) {
    this.client = new vision.ImageAnnotatorClient({
      credentials: JSON.parse(credentials)
    });
  }

  private async getImageBase64(uri: string): Promise<string> {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Remove data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    }
  }

  private extractTotal(text: string): number | undefined {
    // Recherche des motifs communs pour les totaux sur les reçus
    const totalPatterns = [
      /total\s*:?\s*[\$€]?\s*(\d+[.,]\d{2})/i,
      /montant\s*:?\s*[\$€]?\s*(\d+[.,]\d{2})/i,
      /[\$€]\s*(\d+[.,]\d{2})\s*$/m
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }
    return undefined;
  }

  private extractDate(text: string): string | undefined {
    // Recherche des motifs de date communs
    const datePatterns = [
      /(\d{2}[-/.]\d{2}[-/.]\d{2,4})/,
      /(\d{4}[-/.]\d{2}[-/.]\d{2})/
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return undefined;
  }

  private extractStoreName(text: string): string | undefined {
    // Généralement, le nom du magasin est dans les premières lignes
    const lines = text.split('\n');
    if (lines.length > 0) {
      // Prend la première ligne non vide qui n'est pas une date
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.match(/^\d{2}[-/.]\d{2}[-/.]\d{2,4}$/)) {
          return trimmedLine;
        }
      }
    }
    return undefined;
  }

  private extractItems(text: string): Array<{ name: string; price: number }> {
    const items: Array<{ name: string; price: number }> = [];
    const lines = text.split('\n');

    // Pattern pour trouver les prix
    const pricePattern = /[\$€]?\s*(\d+[.,]\d{2})\s*$/;

    for (const line of lines) {
      const match = line.match(pricePattern);
      if (match) {
        const price = parseFloat(match[1].replace(',', '.'));
        // Le nom de l'article est tout ce qui précède le prix
        const name = line.substring(0, line.indexOf(match[0])).trim();
        if (name && price) {
          items.push({ name, price });
        }
      }
    }

    return items;
  }

  public async analyzeReceipt(imageUri: string): Promise<ReceiptData> {
    try {
      // Convertir l'image en base64
      const imageContent = await this.getImageBase64(imageUri);

      // Faire la requête à l'API Vision
      const [result] = await this.client.textDetection({
        image: {
          content: imageContent
        }
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        throw new Error("Aucun texte détecté sur l'image");
      }

      // Le premier élément contient tout le texte
      const fullText = detections[0].description || '';

      // Extraire les informations pertinentes
      return {
        store: this.extractStoreName(fullText),
        total: this.extractTotal(fullText),
        date: this.extractDate(fullText),
        items: this.extractItems(fullText)
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse OCR:', error);
      throw error;
    }
  }
} 