export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  taxRate?: number;
  originalText?: string; // Texte original extrait de la facture
}

export interface Taxes {
  tps: number;
  tvq: number;
  other?: {
    name: string;
    amount: number;
  }[];
}

export interface Receipt {
  id: string;
  date: Date;
  company: string;
  category: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  taxes: Taxes;
  totalAmount: number;
  currency: string;
  notes?: string;
  metadata?: {
    processedAt: Date;
    ocrEngine: string;
    version: string;
    confidence: number;
    originalText?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isCustom?: boolean;
}

export type ReceiptValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  corrections?: {
    field: string;
    original: any;
    corrected: any;
    reason: string;
  }[];
};

// Ajout d'un export par défaut vide pour éviter que le fichier soit traité comme une route
export default {}; 