import { getReceipts } from './storage';
import { Receipt } from './types';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { generateId } from '@/app/lib/helpers';
import { defaultCategories } from './categories';
import OpenAI from 'openai';
import { detectLanguage, SYSTEM_PROMPTS } from './language';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
const GOOGLE_API_KEY = Constants.expoConfig?.extra?.googleCloudApiKey;
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openAiApiKey;

const VISION_MODEL = 'gpt-4o';
const CHAT_MODEL = 'gpt-4-1106-preview';

// Initialiser le client OpenAI
const openai = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.openAiApiKey,
  dangerouslyAllowBrowser: true // Nécessaire pour React Native
});

// Note: Nous utilisons maintenant gpt-4o, le nouveau modèle de vision d'OpenAI
// Il offre de meilleures performances et une meilleure précision pour l'analyse d'images

const SYSTEM_PROMPT = `Tu es un expert en analyse de reçus. Ta tâche est d'extraire les informations suivantes d'une image de reçu :
- Nom de l'entreprise
- Date de la transaction
- Liste des produits avec leurs prix et quantités
- Sous-total
- Taxes (TPS et TVQ)
- Montant total
- Méthode de paiement

Format de réponse attendu en JSON :
{
  "company": string,
  "date": string (ISO format),
  "products": Array<{
    "name": string,
    "price": number,
    "quantity": number
  }>,
  "subtotal": number,
  "taxes": {
    "tps": number,
    "tvq": number
  },
  "totalAmount": number,
  "paymentMethod": string
}

Instructions spécifiques :
1. Les montants doivent être des nombres (pas de symboles $ ou autres)
2. La date doit être au format ISO
3. Les taxes doivent être séparées en TPS et TVQ
4. Les quantités doivent être des nombres entiers
5. Les prix doivent avoir 2 décimales maximum`;

async function getImageBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

async function analyzeTextWithOpenAI(text: string) {
  try {
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
          content: "You are a receipt analyzer. Extract structured information from the receipt text. Return JSON with: storeName, date, total, items (array of {name, price, quantity}), taxRate."
        }, {
          role: "user",
          content: text
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'appel à l\'API OpenAI');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing text with OpenAI:', error);
    throw error;
  }
}

interface AnalyzedItem {
  name: string;
  price: number;
  quantity?: number;
}

export async function analyzeReceiptImage(imageUri: string) {
  try {
    // 1. OCR avec Google Cloud Vision
    const imageContent = await getImageBase64(imageUri);
    const requestBody = {
      requests: [{
        image: { content: imageContent },
        features: [{ type: 'TEXT_DETECTION' }]
      }]
    };

    const response = await fetch(`${VISION_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'appel à l\'API Vision');
    }

    const data = await response.json();
    const textAnnotations = data.responses[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      throw new Error('Aucun texte détecté sur l\'image');
    }

    // 2. Analyse avec OpenAI
    const fullText = textAnnotations[0].description;
    console.log('Texte envoyé à OpenAI:', fullText);
    const analyzedData = await analyzeTextWithOpenAI(fullText);
    console.log('Réponse OpenAI:', analyzedData);

    // 3. Création de l'objet receipt avec vérifications
    const receipt = {
      id: generateId(),
      company: analyzedData?.vendeur?.nom || analyzedData?.storeName || 'Unknown Store',
      date: analyzedData?.date_emission ? new Date(analyzedData.date_emission) : new Date(),
      products: Array.isArray(analyzedData?.articles) 
        ? analyzedData.articles.map((item: any) => ({
            id: generateId(),
            name: item?.description || 'Unknown Item',
            price: Number(item?.prix_unitaire) || 0,
            quantity: Number(item?.quantite) || 1,
            taxRate: 0
          }))
        : [],
      totalAmount: Number(analyzedData?.total_general) || 0,
      category: defaultCategories[0].id,
      paymentMethod: analyzedData?.paiement?.mode || 'Non spécifié'
    };

    console.log('Receipt créé:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    throw error;
  }
}

export async function analyzeSpendingData(question: string): Promise<string> {
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

interface ReceiptItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

export async function extractReceiptData(imageBase64: string): Promise<Partial<Receipt>> {
  try {
    const response = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en analyse de reçus. Analyse l'image du reçu et retourne les informations au format JSON.
Si une information n'est pas visible ou incertaine, utilise une valeur par défaut raisonnable et ajoute une note dans le champ "notes".

Règles importantes pour les longues factures :
1. Retourne UNIQUEMENT le JSON, sans texte avant ou après
2. N'inclus PAS de commentaires dans le JSON
3. Utilise "Inconnu" pour les champs texte non visibles
4. Utilise 0 pour les champs numériques non visibles
5. Utilise la date du jour pour une date non visible
6. Ajoute toute incertitude dans le champ "notes"
7. Pour les longues listes de produits, groupe les articles similaires
8. Si la liste est trop longue, priorise les articles les plus chers
9. Vérifie que les totaux correspondent à la somme des produits

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
  "tax": 0.00,
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
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const jsonStr = content.trim();
    console.log('Réponse brute:', jsonStr);

    try {
      const parsedData = JSON.parse(jsonStr);
      console.log('Données parsées:', parsedData);

      // Validation des données avec valeurs par défaut
      const validatedData = {
        company: parsedData.company || "Inconnu",
        date: parsedData.date || new Date().toISOString(),
        items: Array.isArray(parsedData.items) ? parsedData.items.map((item: ReceiptItem) => ({
          ...item,
          id: item.id || generateId()
        })) : [],
        subtotal: typeof parsedData.subtotal === 'number' ? parsedData.subtotal : 0,
        tax: typeof parsedData.tax === 'number' ? parsedData.tax : 0,
        totalAmount: typeof parsedData.totalAmount === 'number' ? parsedData.totalAmount : 0,
        category: "shopping",
        currency: "CAD",
        notes: parsedData.notes || "",
        metadata: {
          processedAt: new Date(),
          ocrEngine: "OpenAI GPT-4V",
          version: "2.0",
          confidence: 0.98,
          originalText: content
        }
      };

      console.log('Données validées:', validatedData);
      return validatedData;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Erreur de parsing JSON:', error);
        throw new Error(`Erreur de parsing JSON: ${error.message}`);
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de l\'extraction des données:', error);
    throw error;
  }
}

// Export par défaut vide pour éviter l'erreur de route
export default {}; 