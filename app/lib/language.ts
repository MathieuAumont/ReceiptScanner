// Fonction simple pour détecter la langue basée sur les caractères spéciaux et les mots communs
export function detectLanguage(text: string): 'fr' | 'en' {
  // Convertir en minuscules pour la comparaison
  const lowerText = text.toLowerCase();
  
  // Mots communs en français
  const frenchWords = [
    'je', 'tu', 'il', 'nous', 'vous', 'ils',
    'le', 'la', 'les', 'un', 'une', 'des',
    'et', 'ou', 'mais', 'donc',
    'que', 'qui', 'quoi', 'quel', 'quelle',
    'combien', 'pourquoi', 'comment',
    'dans', 'sur', 'sous', 'avec',
    'plus', 'moins', 'beaucoup',
    'aujourd\'hui', 'hier', 'demain',
    'mois', 'semaine', 'année',
    'dépense', 'dépenses', 'argent', 'euros', 'moyenne'
  ];

  // Mots communs en anglais
  const englishWords = [
    'i', 'you', 'he', 'she', 'we', 'they',
    'the', 'a', 'an', 'this', 'that', 'these',
    'and', 'or', 'but', 'so',
    'what', 'which', 'who', 'where', 'when',
    'how', 'much', 'many', 'why',
    'in', 'on', 'at', 'with',
    'more', 'less', 'lot',
    'today', 'yesterday', 'tomorrow',
    'month', 'week', 'year',
    'spend', 'spent', 'money', 'dollars', 'average'
  ];

  let frenchScore = 0;
  let englishScore = 0;

  // Vérifier les caractères spéciaux français
  if (lowerText.includes('é') || lowerText.includes('è') || 
      lowerText.includes('ê') || lowerText.includes('à') || 
      lowerText.includes('ç')) {
    frenchScore += 2;
  }

  // Compter les mots communs
  const words = lowerText.split(/\s+/);
  words.forEach(word => {
    if (frenchWords.includes(word)) frenchScore++;
    if (englishWords.includes(word)) englishScore++;
  });

  return frenchScore >= englishScore ? 'fr' : 'en';
}

// Prompts système pour chaque langue
export const SYSTEM_PROMPTS = {
  fr: `Tu es un assistant financier expert en analyse de dépenses. 
  Analyse les données des reçus fournis et réponds aux questions sur les habitudes de dépenses.
  Sois précis, professionnel mais amical dans tes réponses.
  Utilise le système métrique et la devise CAD.
  Fournis des insights utiles et des suggestions pratiques quand c'est pertinent.`,
  
  en: `You are a financial assistant expert in spending analysis.
  Analyze the provided receipt data and answer questions about spending habits.
  Be precise, professional but friendly in your responses.
  Use the metric system and CAD currency.
  Provide useful insights and practical suggestions when relevant.`
};

// Export par défaut vide pour éviter l'erreur de route
export default {}; 