import { getReceipts } from './storage';
import { Receipt } from './types';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { generateId } from '@/app/lib/helpers';
import { defaultCategories } from './categories';
import { detectLanguage, SYSTEM_PROMPTS } from './language';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openAiApiKey;

// Fonction pour convertir l'image en base64
async function getImageBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

// Interface pour les données extraites
interface ExtractedReceiptData {
  company: string;
  date: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  taxes: {
    tps: number;
    tvq: number;
  };
  totalAmount: number;
  category: string;
  currency: string;
  metadata: {
    processedAt: Date;
    ocrEngine: string;
    version: string;
    confidence: number;
    originalText?: string;
  };
}

export async function extractReceiptData(imageBase64: string): Promise<ExtractedReceiptData> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
    throw new Error('OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en analyse de reçus. Analyse l'image du reçu et retourne les informations au format JSON.

Format attendu :
{
  "company": "nom de l'entreprise",
  "date": "2024-03-20T00:00:00.000Z",
  "items": [
    {
      "id": "id-unique",
      "name": "nom du produit",
      "price": 0.00,
      "quantity": 1
    }
  ],
  "subtotal": 0.00,
  "taxes": {
    "tps": 0.00,
    "tvq": 0.00
  },
  "totalAmount": 0.00,
  "notes": "notes sur les incertitudes"
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: "Analyse ce reçu et retourne UNIQUEMENT le JSON sans commentaires ni texte supplémentaire." },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }

    const parsedData = JSON.parse(content);

    // Validation et normalisation des données
    const validatedData: ExtractedReceiptData = {
      company: parsedData.company || "Inconnu",
      date: parsedData.date || new Date().toISOString(),
      items: Array.isArray(parsedData.items) ? parsedData.items.map((item: any) => ({
        id: item.id || generateId(),
        name: item.name || "Article inconnu",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })) : [],
      subtotal: Number(parsedData.subtotal) || 0,
      taxes: {
        tps: Number(parsedData.taxes?.tps) || 0,
        tvq: Number(parsedData.taxes?.tvq) || 0
      },
      totalAmount: Number(parsedData.totalAmount) || 0,
      category: "shopping",
      currency: "CAD",
      metadata: {
        processedAt: new Date(),
        ocrEngine: "OpenAI GPT-4V",
        version: "2.0",
        confidence: 0.98,
        originalText: content
      }
    };

    return validatedData;
  } catch (error) {
    console.error('Error extracting receipt data:', error);
    throw error;
  }
}

export async function analyzeSpendingData(question: string): Promise<string> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
    throw new Error('OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
  }

  try {
    const receipts = await getReceipts();
    const language = detectLanguage(question);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: SYSTEM_PROMPTS[language]
        }, {
          role: "user",
          content: `Receipts data: ${JSON.stringify(receipts)}\n\nQuestion: ${question}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(language === 'fr' ? 
        'Erreur lors de l\'appel à l\'API OpenAI' : 
        'Error calling OpenAI API'
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing spending data:', error);
    throw new Error(detectLanguage(question) === 'fr' ?
      'Erreur lors de l\'analyse des dépenses' :
      'Error analyzing spending data'
    );
  }
}

// Export par défaut vide pour éviter l'erreur de route
export default {};