import { Receipt } from './types';
import { generateId } from '@/app/lib/helpers';
import { extractReceiptData } from './openai';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { captureRef } from 'react-native-view-shot';
import { WebView } from 'react-native-webview';
import React, { useRef } from 'react';

async function convertPdfToImage(uri: string): Promise<string> {
  // Pour l'instant, nous allons simplement rejeter les PDF
  // TODO: La conversion PDF vers image nécessite une approche différente
  // car elle doit être faite dans un composant React
  throw new Error("PDF processing requires using the PdfConverter component");
}

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

export async function processReceipt(uri: string): Promise<Receipt> {
  try {
    let processableUri = uri;
    
    // Si c'est un PDF, on doit utiliser le composant PdfConverter
    if (uri.toLowerCase().endsWith('.pdf')) {
      throw new Error("Please use the PdfConverter component for PDF files");
    }

    // Prétraiter l'image
    processableUri = await preprocessImage(processableUri);

    // Convertir l'image en base64
    const response = await fetch(processableUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); // Enlever le préfixe data:image/...
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Extraire les données avec OpenAI
    const extractedData = await extractReceiptData(base64);

    // Créer l'objet Receipt complet
    const receipt: Receipt = {
      id: generateId(),
      ...extractedData,
      subtotal: extractedData.subtotal,
      totalAmount: extractedData.totalAmount,
      taxes: {
        tps: extractedData.taxes?.tps || 0,
        tvq: extractedData.taxes?.tvq || 0
      },
      originalImage: uri
    } as Receipt;

    return receipt;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}

// Export par défaut vide pour éviter l'erreur de route
export default {}; 