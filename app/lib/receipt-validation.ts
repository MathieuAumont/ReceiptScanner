import { Receipt, ReceiptValidationResult, Product, Taxes } from './types';

/**
 * Valide une facture et retourne le résultat de la validation
 */
export function validateReceipt(receipt: Receipt): ReceiptValidationResult {
  const result: ReceiptValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    corrections: []
  };

  // Validation de base
  if (!receipt.company) {
    result.errors.push('Le nom du magasin est manquant');
  }

  if (!receipt.date || isNaN(receipt.date.getTime())) {
    result.errors.push('La date est invalide');
  }

  if (receipt.date && receipt.date > new Date()) {
    result.errors.push('La date est dans le futur');
  }

  // Validation des produits
  if (!receipt.products || receipt.products.length === 0) {
    result.errors.push('Aucun produit trouvé');
  } else {
    receipt.products.forEach((product, index) => {
      if (!product.name || product.name.length < 2) {
        result.errors.push(`Produit ${index + 1}: Nom invalide`);
      }
      if (typeof product.price !== 'number' || product.price <= 0) {
        result.errors.push(`Produit ${index + 1}: Prix invalide`);
      }
      if (typeof product.quantity !== 'number' || product.quantity <= 0) {
        result.errors.push(`Produit ${index + 1}: Quantité invalide`);
      }
    });
  }

  // Validation des montants
  const calculatedSubtotal = calculateSubtotal(receipt.products);
  if (Math.abs(calculatedSubtotal - receipt.subtotal) > 0.02) {
    result.warnings.push(`Différence dans le sous-total: calculé=${calculatedSubtotal.toFixed(2)}, trouvé=${receipt.subtotal.toFixed(2)}`);
    result.corrections?.push({
      field: 'subtotal',
      original: receipt.subtotal,
      corrected: calculatedSubtotal,
      reason: 'Le sous-total ne correspond pas à la somme des produits'
    });
  }

  // Validation des taxes
  const expectedTaxes = calculateExpectedTaxes(receipt.subtotal);
  if (Math.abs(expectedTaxes.tps - receipt.taxes.tps) > 0.02) {
    result.warnings.push(`Différence dans la TPS: calculée=${expectedTaxes.tps.toFixed(2)}, trouvée=${receipt.taxes.tps.toFixed(2)}`);
    result.corrections?.push({
      field: 'taxes.tps',
      original: receipt.taxes.tps,
      corrected: expectedTaxes.tps,
      reason: 'La TPS ne correspond pas au taux attendu (5%)'
    });
  }

  if (Math.abs(expectedTaxes.tvq - receipt.taxes.tvq) > 0.02) {
    result.warnings.push(`Différence dans la TVQ: calculée=${expectedTaxes.tvq.toFixed(2)}, trouvée=${receipt.taxes.tvq.toFixed(2)}`);
    result.corrections?.push({
      field: 'taxes.tvq',
      original: receipt.taxes.tvq,
      corrected: expectedTaxes.tvq,
      reason: 'La TVQ ne correspond pas au taux attendu (9.975%)'
    });
  }

  // Validation du total
  const calculatedTotal = calculatedSubtotal + expectedTaxes.tps + expectedTaxes.tvq;
  if (Math.abs(calculatedTotal - receipt.totalAmount) > 0.02) {
    result.warnings.push(`Différence dans le total: calculé=${calculatedTotal.toFixed(2)}, trouvé=${receipt.totalAmount.toFixed(2)}`);
    result.corrections?.push({
      field: 'totalAmount',
      original: receipt.totalAmount,
      corrected: calculatedTotal,
      reason: 'Le total ne correspond pas à la somme du sous-total et des taxes'
    });
  }

  // Validation du mode de paiement
  const validPaymentMethods = ['INTERAC', 'VISA', 'MASTERCARD', 'COMPTANT', 'CASH', 'DEBIT', 'CREDIT'];
  if (!validPaymentMethods.includes(receipt.paymentMethod.toUpperCase())) {
    result.warnings.push(`Mode de paiement inconnu: ${receipt.paymentMethod}`);
  }

  // Mise à jour du statut de validité
  result.isValid = result.errors.length === 0;

  return result;
}

/**
 * Calcule le sous-total à partir des produits
 */
function calculateSubtotal(products: Product[]): number {
  return Math.round(
    products.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100
  ) / 100;
}

/**
 * Calcule les taxes attendues à partir du sous-total
 */
function calculateExpectedTaxes(subtotal: number): Taxes {
  return {
    tps: Math.round(subtotal * 0.05 * 100) / 100,
    tvq: Math.round(subtotal * 0.09975 * 100) / 100
  };
}

/**
 * Applique les corrections suggérées à une facture
 */
export function applyCorrections(receipt: Receipt, validationResult: ReceiptValidationResult): Receipt {
  if (!validationResult.corrections) return receipt;

  const correctedReceipt = { ...receipt };

  validationResult.corrections.forEach(correction => {
    const fields = correction.field.split('.');
    let target: any = correctedReceipt;
    
    // Naviguer jusqu'au dernier champ
    for (let i = 0; i < fields.length - 1; i++) {
      target = target[fields[i]];
    }
    
    // Appliquer la correction
    target[fields[fields.length - 1]] = correction.corrected;
  });

  return correctedReceipt;
}

/**
 * Formate les erreurs et avertissements pour l'affichage
 */
export function formatValidationMessages(validationResult: ReceiptValidationResult): string {
  const messages: string[] = [];

  if (validationResult.errors.length > 0) {
    messages.push('Erreurs :');
    messages.push(...validationResult.errors.map(error => `❌ ${error}`));
  }

  if (validationResult.warnings.length > 0) {
    if (messages.length > 0) messages.push('');
    messages.push('Avertissements :');
    messages.push(...validationResult.warnings.map(warning => `⚠️ ${warning}`));
  }

  if (validationResult.corrections && validationResult.corrections.length > 0) {
    if (messages.length > 0) messages.push('');
    messages.push('Corrections suggérées :');
    messages.push(...validationResult.corrections.map(correction => 
      `🔄 ${correction.field}: ${correction.original} → ${correction.corrected} (${correction.reason})`
    ));
  }

  return messages.join('\n');
}

// Export par défaut des fonctions principales
export default {
  validateReceipt,
  applyCorrections,
  formatValidationMessages
}; 