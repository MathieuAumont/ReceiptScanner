import { Receipt } from './types';
import { generateId } from '@/app/lib/helpers';
import { extractReceiptData } from './openai';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

async function preprocessImage(uri: string): Promise<string> {
  try {
    // Redimensionner l'image si elle est trop grande
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1500 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw error;
  }
}

async function convertImageToBase64(uri: string): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]); // Enlever le préfixe data:image/...
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
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

export async function processReceipt(uri: string): Promise<Receipt> {
  try {
    let processableUri = uri;
    
    // Si c'est un PDF, rejeter pour l'instant
    if (uri.toLowerCase().endsWith('.pdf')) {
      throw new Error("PDF processing is not yet supported");
    }

    // Prétraiter l'image
    processableUri = await preprocessImage(processableUri);

    // Convertir l'image en base64
    const base64 = await convertImageToBase64(processableUri);

    // Extraire les données avec OpenAI
    const extractedData = await extractReceiptData(base64);

    // Créer l'objet Receipt complet
    const receipt: Receipt = {
      id: generateId(),
      company: extractedData.company,
      date: new Date(extractedData.date),
      items: extractedData.items,
      subtotal: extractedData.subtotal,
      totalAmount: extractedData.totalAmount,
      taxes: extractedData.taxes,
      category: extractedData.category,
      currency: extractedData.currency,
      metadata: extractedData.metadata,
      originalImage: uri
    };

    return receipt;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}

// Export par défaut vide pour éviter l'erreur de route
export default {};