// Types de base pour le parser de factures
export interface Vendeur {
  nom: string;
  adresse?: string;
  telephone?: string;
  site_web?: string;
}

export interface Acheteur {
  nom?: string;
  adresse?: string;
  reference?: string;
}

export interface Article {
  description: string;
  code_barre?: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  taux_taxe?: number;
}

export interface Taxes {
  [cle: string]: number; // Ex: { "TPS": 2.5, "TVQ": 4.9 }
}

export interface Paiement {
  mode: string;
  montant: number;
  statut?: string;
  reference?: string;
}

interface Facture {
  vendeur: {
    nom: string;
    adresse?: string;
    telephone?: string;
    site_web?: string;
  };
  articles: Article[];
  taxes: {
    'TPS': number;
    'TVQ': number;
    [key: string]: number;
  };
  metadata: {
    texte_original: string;
    warnings: string[];
  };
  sous_total?: number;
  total_general?: number;
  paiement?: {
    mode: string;
    montant: number;
  };
  date_emission?: string;
  numero?: string;
}

// Amélioration des patterns
const PATTERNS = {
  telephone: /(?:\+?\d{1,2}\s*)?(?:\(\d{3}\)\s*|\d{3}[-.]?\s*)\d{3}[-.]?\s*\d{4}/,
  code_postal: /[A-Z]\d[A-Z]\s*\d[A-Z]\d/i,
  site_web: /(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/i,
  date: [
    /(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(\d{4})/i,
    /(\d{2})[-/.]\s*(\d{2})[-/.]\s*(\d{4})/,
    /(\d{4})[-/.]\s*(\d{2})[-/.]\s*(\d{2})/
  ],
  montant: /(\d+[.,]\d{2})\s*\$?$/,
  code_barre: /^[0-9]{8,14}$/,
  numero_facture: /(?:facture|reçu|ticket)\s*#?\s*[:.]?\s*(\d+)/i,
  quantite: [
    /^(\d+)\s*[xX]\s*/,
    /^(\d+)\s*@\s*/,
    /\((\d+)\)/,
    /QTE\s*:\s*(\d+)/i,
    /(\d+)\s*Article\(s\)/i
  ],
  adresse: [
    /^\d{1,5}\s+(?:[A-Za-zÀ-ÿ\s-]+(?:rue|avenue|boulevard|chemin|boul\.|av\.|ch\.))/i,
    /^(?:Saint|Sainte|St|Ste)-[A-Za-zÀ-ÿ\s-]+(?:,\s*[A-Z]{2})?/i,
    /^[A-Za-zÀ-ÿ\s-]+(?:,\s*[A-Z]{2})?/i
  ],
  taxes: [
    /(?:TPS|GST)\s*:?\s*(\d+[.,]\d{2})\s*\$?$/i,
    /(?:TVQ|QST)\s*:?\s*(\d+[.,]\d{2})\s*\$?$/i,
    /^TPS\s*:?\s*(\d+[.,]\d{2})\s*\$?/i,
    /^TVQ\s*:?\s*(\d+[.,]\d{2})\s*\$?/i,
    /^(?:TPS|GST)\s*(\d+[.,]\d{2})\s*\$?/i,
    /^(?:TVQ|QST)\s*(\d+[.,]\d{2})\s*\$?/i,
    /TPS\s*(\d+[.,]\d{2})\s*\$?/i,
    /TVQ\s*(\d+[.,]\d{2})\s*\$?/i
  ],
  total: [
    /(?:^|\s)(?:TOTAL|MONTANT)\s*:?\s*(\d+[.,]\d{2})\s*\$?$/i,
    /^TOTAL\s*:?\s*(\d+[.,]\d{2})/i,
    /^(?:TOTAL|MONTANT)\s*:?\s*(\d+[.,]\d{2})/i,
    /TOTAL\s*:?\s*(\d+[.,]\d{2})/i
  ],
  paiement: [
    /(?:INTERAC|VISA|MASTERCARD|DÉBIT|CREDIT|COMPTANT|CASH)\s*:?\s*(\d+[.,]\d{2})\s*\$?$/i,
    /^(?:INTERAC|VISA|MASTERCARD|DÉBIT|CREDIT|COMPTANT|CASH)\s*(\d+[.,]\d{2})/i,
    /^INTERAC\s*(\d+[.,]\d{2})/i
  ]
};

interface MagasinConnu {
  variations: string[];
  site_web: string;
  taxes: {
    TPS: number;
    TVQ: number;
  };
}

const MAGASINS_CONNUS: { [key: string]: MagasinConnu } = {
  'imaginaire': {
    variations: ["L'Imaginaire", "L'IMAGINAIRE", "IMAGINAIRE"],
    site_web: 'www.imaginaire.com',
    taxes: { TPS: 0.05, TVQ: 0.09975 }
  },
  'walmart': {
    variations: ["Walmart", "WAL-MART", "WAL MART"],
    site_web: 'www.walmart.ca',
    taxes: { TPS: 0.05, TVQ: 0.09975 }
  },
  // Ajoutez d'autres magasins connus ici
};

/**
 * Nettoie et normalise le texte avant l'analyse
 */
function normaliserTexte(texte: string): string[] {
  return texte
    .split(/\r?\n/)
    .map(ligne => ligne.trim())
    .filter(ligne => ligne.length > 0);
}

/**
 * Extrait un montant d'une ligne de texte
 */
function extraireMontant(ligne: string): number {
  // Nettoyer la ligne
  ligne = ligne.trim();
  
  // Pattern pour les montants avec symbole dollar
  const montantPattern = /(\d+[.,]\d{2})\s*\$?$/;
  const match = ligne.match(montantPattern);
  
  if (match) {
    // Remplacer la virgule par un point pour la conversion
    const montant = parseFloat(match[1].replace(',', '.'));
    return Math.round(montant * 100) / 100; // Arrondir à 2 décimales
  }
  
  return 0;
}

/**
 * Extrait les taxes d'une ligne de texte
 */
function extraireTaxes(ligne: string): { type: 'TPS' | 'TVQ' | null, montant: number } {
  ligne = ligne.trim().toUpperCase();
  
  // Vérifier si c'est une ligne de taxe
  if (ligne.includes('TPS') || ligne.includes('GST')) {
    return {
      type: 'TPS',
      montant: extraireMontant(ligne)
    };
  }
  
  if (ligne.includes('TVQ') || ligne.includes('QST')) {
    return {
      type: 'TVQ',
      montant: extraireMontant(ligne)
    };
  }
  
  return { type: null, montant: 0 };
}

function extraireMontantEtMode(ligne: string): { montant: number; mode?: string } {
  const montant = extraireMontant(ligne);
  const mode = ligne.match(/^[A-Za-zÉé]+/)?.[0]?.toUpperCase();
  return { montant, mode };
}

/**
 * Identifie le vendeur à partir des premières lignes
 */
function identifierVendeur(lignes: string[]): Vendeur {
  const vendeur: Vendeur = { nom: "Inconnu" };
  
  // Recherche dans les 10 premières lignes
  const premieresLignes = lignes.slice(0, 10);
  let adresseTemp = [];
  let adresseComplete = false;
  
  for (const [key, magasin] of Object.entries(MAGASINS_CONNUS)) {
    for (const ligne of premieresLignes) {
      const ligneLower = ligne.toLowerCase();
      if (ligneLower.includes(key) || magasin.variations.some(v => ligne.includes(v))) {
        vendeur.nom = magasin.variations[0];
        vendeur.site_web = magasin.site_web;
        break;
      }
    }
    if (vendeur.nom !== "Inconnu") break;
  }

  // Recherche de l'adresse et du téléphone
  for (let i = 0; i < premieresLignes.length && !adresseComplete; i++) {
    const ligne = premieresLignes[i];
    
    if (!vendeur.telephone && PATTERNS.telephone.test(ligne)) {
      vendeur.telephone = ligne.match(PATTERNS.telephone)![0];
      continue;
    }
    
    if (!vendeur.site_web && PATTERNS.site_web.test(ligne)) {
      vendeur.site_web = ligne.match(PATTERNS.site_web)![0];
      continue;
    }
    
    // Détection d'adresse améliorée
    for (const pattern of PATTERNS.adresse) {
      if (pattern.test(ligne)) {
        // Ignorer les lignes qui contiennent des mots-clés non pertinents
        if (!/facture|client|employé|caisse|www\.|@|cupie/i.test(ligne)) {
          adresseTemp.push(ligne.trim());
          // Vérifier la ligne suivante pour le code postal
          if (i < premieresLignes.length - 1) {
            const nextLine = premieresLignes[i + 1];
            if (PATTERNS.code_postal.test(nextLine)) {
              adresseTemp.push(nextLine.match(PATTERNS.code_postal)![0]);
              i++; // Sauter la ligne suivante
              adresseComplete = true;
            }
          }
          break;
        }
      }
    }
  }

  if (adresseTemp.length > 0) {
    vendeur.adresse = adresseTemp.join(', ');
  }

  return vendeur;
}

/**
 * Extrait les informations d'un article
 */
function extraireArticle(ligne: string, ligneSuivante: string): Article | null {
  // Ignorer les lignes qui ne sont pas des articles
  const motsAIgnorer = ['sous-total', 'total', 'tps', 'tvq', 'gst', 'qst', 'interac', 'visa', 'mastercard'];
  if (motsAIgnorer.some(mot => ligne.toLowerCase().includes(mot))) {
    return null;
  }

  // Vérifier si c'est un code-barre
  if (PATTERNS.code_barre.test(ligne)) {
    return null;
  }

  let quantite = 1;
  let description = ligne;
  let prix_unitaire = 0;
  let total = 0;

  // Recherche de la quantité
  for (const pattern of PATTERNS.quantite) {
    const match = description.match(pattern);
    if (match) {
      quantite = parseInt(match[1]);
      description = description.replace(pattern, '').trim();
      break;
    }
  }

  // Recherche du prix
  const prixMatch = ligneSuivante.match(PATTERNS.montant);
  if (prixMatch) {
    total = parseFloat(prixMatch[1].replace(',', '.'));
    prix_unitaire = total / quantite;
  } else {
    return null;
  }

  // Nettoyage de la description
  description = description
    .replace(/^\d+\s*[xX]\s*/, '') // Enlever la quantité au début
    .replace(/\s*\(\d+\)\s*$/, '') // Enlever la quantité à la fin
    .trim();

  return {
    description,
    quantite,
    prix_unitaire,
    total
  };
}

/**
 * Parse une facture à partir d'un texte brut
 */
export function parserFactureUniverselle(texte: string): Facture {
  const lignes = normaliserTexte(texte);
  const facture: Facture = {
    vendeur: identifierVendeur(lignes),
    articles: [],
    taxes: {
      'TPS': 0,
      'TVQ': 0
    },
    metadata: {
      texte_original: texte,
      warnings: []
    }
  };

  let articleEnCours: Article | null = null;
  let nombreArticlesTotal = 0;
  let dernierMontant = 0;

  let sousTotal = 0;
  let totalGeneral = 0;
  let tpsDetectee = false;
  let tvqDetectee = false;

  // Premier passage : recherche des montants clés (taxes, total, paiement)
  for (const ligne of lignes) {
    const ligneLower = ligne.toLowerCase();
    const montantLigne = extraireMontant(ligne);

    // Sous-total
    if (ligneLower.includes('sous-total')) {
      sousTotal = montantLigne;
      facture.sous_total = sousTotal;
      continue;
    }

    // Taxes avec patterns améliorés
    for (const pattern of PATTERNS.taxes) {
      const match = ligne.match(pattern);
      if (match) {
        const montant = parseFloat(match[1].replace(',', '.'));
        if (/tps|gst/i.test(ligne)) {
          facture.taxes['TPS'] = montant;
          tpsDetectee = true;
          console.log('TPS détectée:', montant);
        } else if (/tvq|qst/i.test(ligne)) {
          facture.taxes['TVQ'] = montant;
          tvqDetectee = true;
          console.log('TVQ détectée:', montant);
        }
      }
    }

    // Total avec pattern amélioré
    for (const pattern of PATTERNS.total) {
      const match = ligne.match(pattern);
      if (match && !ligneLower.includes('sous')) {
        const montant = parseFloat(match[1].replace(',', '.'));
        if (montant > 0) {
          totalGeneral = montant;
          facture.total_general = montant;
          dernierMontant = montant;
          break;
        }
      }
    }

    // Paiement avec pattern amélioré
    for (const pattern of PATTERNS.paiement) {
      const match = ligne.match(pattern);
      if (match) {
        const montant = parseFloat(match[1].replace(',', '.'));
        const mode = ligne.match(/^[A-Za-zÉé]+/)?.[0]?.toUpperCase() || 'INCONNU';
        facture.paiement = {
          mode,
          montant: montant || dernierMontant
        };
      }
    }

    // Détection du paiement par le mode seul
    if (!facture.paiement && /^(?:INTERAC|VISA|MASTERCARD|DÉBIT|CREDIT|COMPTANT|CASH)\s*$/i.test(ligne)) {
      const mode = ligne.match(/^[A-Za-zÉé]+/)?.[0]?.toUpperCase() || 'INCONNU';
      facture.paiement = {
        mode,
        montant: dernierMontant
      };
    }
  }

  // Deuxième passage : traitement des autres informations
  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    const ligneSuivante = i < lignes.length - 1 ? lignes[i + 1] : '';
    const ligneLower = ligne.toLowerCase();

    // Dates
    for (const pattern of PATTERNS.date) {
      const match = ligne.match(pattern);
      if (match) {
        facture.date_emission = match[0];
        break;
      }
    }

    // Numéro de facture
    const factureMatch = ligne.match(PATTERNS.numero_facture);
    if (factureMatch) {
      facture.numero = factureMatch[1];
    }

    // Nombre total d'articles
    const articlesTotalMatch = ligne.match(/(\d+)\s*Article\(s\)/i);
    if (articlesTotalMatch) {
      nombreArticlesTotal = parseInt(articlesTotalMatch[1]);
    }

    // Articles
    const article = extraireArticle(ligne, ligneSuivante);
    if (article) {
      facture.articles.push(article);
      i++; // Sauter la ligne du prix
      continue;
    }

    // Sous-total
    if (ligneLower.includes('sous-total') || ligneLower.includes('subtotal')) {
      facture.sous_total = extraireMontant(ligne);
    }
  }

  // Regroupement des articles identiques
  const articlesGroupes = new Map<string, Article>();
  for (const article of facture.articles) {
    const key = `${article.description}-${article.prix_unitaire}`;
    if (articlesGroupes.has(key)) {
      const existant = articlesGroupes.get(key)!;
      existant.quantite += article.quantite;
      existant.total = Math.round(existant.quantite * existant.prix_unitaire * 100) / 100;
    } else {
      articlesGroupes.set(key, { ...article });
    }
  }
  facture.articles = Array.from(articlesGroupes.values());

  // Validation et corrections
  if (!facture.sous_total && facture.articles.length > 0) {
    facture.sous_total = Math.round(facture.articles.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
    facture.metadata!.warnings!.push('Sous-total calculé à partir des articles');
  }

  // Vérification du nombre d'articles
  const totalQuantite = facture.articles.reduce((sum, item) => sum + item.quantite, 0);
  if (nombreArticlesTotal > 0 && totalQuantite !== nombreArticlesTotal) {
    facture.metadata!.warnings!.push(`Nombre d'articles détectés (${totalQuantite}) différent du total indiqué (${nombreArticlesTotal})`);
  }

  // Calcul des taxes si nécessaire
  if (facture.vendeur.nom !== "Inconnu" && MAGASINS_CONNUS[facture.vendeur.nom.toLowerCase()]) {
    const magasin = MAGASINS_CONNUS[facture.vendeur.nom.toLowerCase()];
    if ((!tpsDetectee || !tvqDetectee) && facture.sous_total) {
      if (!tpsDetectee) {
        facture.taxes['TPS'] = Math.round(facture.sous_total * magasin.taxes.TPS * 100) / 100;
        facture.metadata.warnings.push('TPS calculée selon le taux standard');
      }
      if (!tvqDetectee) {
        facture.taxes['TVQ'] = Math.round(facture.sous_total * magasin.taxes.TVQ * 100) / 100;
        facture.metadata.warnings.push('TVQ calculée selon le taux standard');
      }
    }
  }

  // Calcul du total général si nécessaire
  if (!facture.total_general && facture.sous_total) {
    const tps = facture.taxes['TPS'];
    const tvq = facture.taxes['TVQ'];
    facture.total_general = Math.round((facture.sous_total + tps + tvq) * 100) / 100;
    facture.metadata.warnings.push('Total général calculé à partir du sous-total et des taxes');
  }

  return facture;
}

// Export par défaut
export default {
  // Ajoutez ici les fonctions principales que vous souhaitez exporter
}; 