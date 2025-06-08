import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt, Category } from './types';
import { generateId } from '@/app/lib/helpers';
import { defaultCategories } from './categories';

const RECEIPTS_KEY = 'receipts';
const SETTINGS_KEY = 'settings';
const CUSTOM_CATEGORIES_KEY = 'custom_categories';
const BUDGETS_KEY = 'budgets';

// Fonction utilitaire pour s'assurer que les nombres restent des nombres
const ensureNumbers = (receipt: Receipt): Receipt => {
  try {
    // Créer une copie profonde pour éviter les modifications accidentelles
    const processedReceipt = JSON.parse(JSON.stringify(receipt));
    
    // Préserver les montants exactement comme ils sont
    return {
      ...processedReceipt,
      totalAmount: Number(processedReceipt.totalAmount) || 0,
      subtotal: Number(processedReceipt.subtotal) || 0,
      taxes: {
        tps: Number(processedReceipt.taxes?.tps) || 0,
        tvq: Number(processedReceipt.taxes?.tvq) || 0
      },
      items: Array.isArray(processedReceipt.items) 
        ? processedReceipt.items.map((item: { price: number | string; quantity: number | string; [key: string]: any }) => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1
          }))
        : []
    };
  } catch (error) {
    console.error('Erreur lors de la conversion des nombres:', error);
    // Retourner un reçu avec des valeurs par défaut
    return {
      ...receipt,
      totalAmount: 0,
      subtotal: 0,
      taxes: { tps: 0, tvq: 0 },
      items: []
    };
  }
};

// Fonction utilitaire pour convertir les dates string en objets Date
const convertDates = (receipt: any): Receipt => {
  return {
    ...receipt,
    date: new Date(receipt.date),
    metadata: receipt.metadata ? {
      ...receipt.metadata,
      processedAt: new Date(receipt.metadata.processedAt)
    } : undefined
  };
};

// Récupérer tous les reçus
export const getReceipts = async (): Promise<Receipt[]> => {
  try {
    const receiptsString = await AsyncStorage.getItem(RECEIPTS_KEY);
    if (!receiptsString) return [];
    
    const receipts = JSON.parse(receiptsString);
    if (!Array.isArray(receipts)) {
      console.error('Les données des reçus ne sont pas un tableau:', receipts);
      return [];
    }
    
    return receipts.map((receipt: any) => convertDates(ensureNumbers(receipt)));
  } catch (error) {
    console.error('Erreur lors de la récupération des reçus:', error);
    return []; // Retourner un tableau vide au lieu de propager l'erreur
  }
};

// Récupérer les reçus récents
export const getRecentReceipts = async (limit: number = 5): Promise<Receipt[]> => {
  try {
    const receipts = await getReceipts();
    return receipts
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Erreur lors de la récupération des reçus récents:', error);
    throw error;
  }
};

// Récupérer un reçu par son ID
export const getReceiptById = async (id: string): Promise<Receipt | null> => {
  try {
    const receipts = await getReceipts();
    const receipt = receipts.find(r => r.id === id);
    return receipt ? ensureNumbers(receipt) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du reçu:', error);
    throw error;
  }
};

// Sauvegarder un reçu
export const saveReceipt = async (receipt: Receipt): Promise<void> => {
  try {
    const receipts = await getReceipts();
    // S'assurer que les nombres sont bien des nombres avant la sauvegarde
    const processedReceipt = ensureNumbers(receipt);
    
    // Vérifier si un reçu avec cet ID existe déjà
    const existingIndex = receipts.findIndex(r => r.id === receipt.id);
    if (existingIndex !== -1) {
      // Si le reçu existe, on le met à jour
      receipts[existingIndex] = processedReceipt;
    } else {
      // Sinon, on l'ajoute à la liste
      receipts.push(processedReceipt);
    }
    
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du reçu:', error);
    throw error;
  }
};

// Mettre à jour un reçu
export const updateReceipt = async (updatedReceipt: Receipt): Promise<void> => {
  try {
    const receipts = await getReceipts();
    const index = receipts.findIndex(r => r.id === updatedReceipt.id);
    if (index !== -1) {
      receipts[index] = ensureNumbers(updatedReceipt);
      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du reçu:', error);
    throw error;
  }
};

// Supprimer un reçu
export const deleteReceipt = async (id: string): Promise<void> => {
  try {
    const receipts = await getReceipts();
    const updatedReceipts = receipts.filter(r => r.id !== id);
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(updatedReceipts));
  } catch (error) {
    console.error('Erreur lors de la suppression du reçu:', error);
    throw error;
  }
};

// Calculer les dépenses totales sur une période
export const getTotalSpending = async (startDate?: Date, endDate?: Date): Promise<number> => {
  try {
    const receipts = await getReceipts();
    
    return receipts
      .filter(receipt => {
        if (!startDate && !endDate) return true;
        const receiptDate = new Date(receipt.date);
        if (startDate && receiptDate < startDate) return false;
        if (endDate && receiptDate > endDate) return false;
        return true;
      })
      .reduce((total, receipt) => total + receipt.totalAmount, 0);
  } catch (error) {
    console.error('Erreur lors du calcul des dépenses totales:', error);
    throw error;
  }
};

// Calculer les dépenses par catégorie
export const getReceiptsByCategory = async (startDate?: Date, endDate?: Date): Promise<Array<{ categoryId: string; amount: number }>> => {
  try {
    const receipts = await getReceipts();
    
    const filteredReceipts = receipts.filter(receipt => {
      if (!startDate && !endDate) return true;
      const receiptDate = new Date(receipt.date);
      if (startDate && receiptDate < startDate) return false;
      if (endDate && receiptDate > endDate) return false;
      return true;
    });

    const categoryTotals = filteredReceipts.reduce((acc, receipt) => {
      const categoryId = receipt.category;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += receipt.totalAmount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals).map(([categoryId, amount]) => ({
      categoryId,
      amount,
    }));
  } catch (error) {
    console.error('Erreur lors du calcul des dépenses par catégorie:', error);
    throw error;
  }
};

// Obtenir les dépenses mensuelles
export const getMonthlySpending = async (numberOfMonths: number = 6): Promise<Array<{ month: string; amount: number }>> => {
  try {
    const receipts = await getReceipts();
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - numberOfMonths + 1, 1);

    const monthlyBreakdown = receipts
      .filter(receipt => new Date(receipt.date) >= startDate)
      .reduce((acc, receipt) => {
        const date = new Date(receipt.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = 0;
        }
        acc[monthKey] += receipt.totalAmount;
        return acc;
      }, {} as Record<string, number>);

    // Créer un tableau pour tous les mois de la période
    const months: Array<{ month: string; amount: number }> = [];
    for (let i = 0; i < numberOfMonths; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.unshift({
        month: date.toLocaleDateString('fr-CA', { month: 'short', year: 'numeric' }),
        amount: monthlyBreakdown[monthKey] || 0,
      });
    }

    return months;
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses mensuelles:', error);
    return [];
  }
};

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECEIPTS_KEY);
    await AsyncStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

// Export data
export async function exportData(): Promise<boolean> {
  try {
    const receiptsString = await AsyncStorage.getItem(RECEIPTS_KEY);
    const settingsString = await AsyncStorage.getItem(SETTINGS_KEY);
    
    const exportData = {
      receipts: receiptsString ? JSON.parse(receiptsString) : [],
      settings: settingsString ? JSON.parse(settingsString) : {},
      exportDate: new Date().toISOString(),
    };
    
    // In a real app, we would save this to a file or share it
    console.log('Exported data:', exportData);
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// Get storage size
export async function getStorageSize(): Promise<string> {
  try {
    const receiptsString = await AsyncStorage.getItem(RECEIPTS_KEY);
    const settingsString = await AsyncStorage.getItem(SETTINGS_KEY);
    
    const totalSize = (receiptsString?.length || 0) + (settingsString?.length || 0);
    return `${(totalSize / 1024).toFixed(2)} KB`;
  } catch (error) {
    console.error('Error getting storage size:', error);
    throw error;
  }
}

// Ajout d'un export par défaut vide pour éviter que le fichier soit traité comme une route
export default {};

export async function saveCustomCategories(categories: Category[]): Promise<void> {
  try {
    const customCategories = categories.filter(cat => cat.isCustom);
    await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
  } catch (error) {
    console.error('Error saving custom categories:', error);
    throw error;
  }
}

export async function loadCustomCategories(): Promise<Category[]> {
  try {
    const customCategoriesJson = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!customCategoriesJson) return [];

    const customCategories = JSON.parse(customCategoriesJson);
    return customCategories;
  } catch (error) {
    console.error('Error loading custom categories:', error);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const customCategories = await loadCustomCategories();
    return [...defaultCategories, ...customCategories];
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error);
    return defaultCategories;
  }
}

interface Budget {
  total: number;
  categories: {
    [categoryId: string]: number;
  };
}

// Obtenir le budget pour un mois spécifique
export async function getBudgetForMonth(monthKey: string): Promise<Budget> {
  try {
    const budgetsString = await AsyncStorage.getItem(BUDGETS_KEY);
    if (!budgetsString) return { total: 0, categories: {} };
    
    const budgets = JSON.parse(budgetsString);
    return budgets[monthKey] || { total: 0, categories: {} };
  } catch (error) {
    console.error('Erreur lors de la récupération du budget:', error);
    return { total: 0, categories: {} };
  }
}

// Sauvegarder le budget pour un mois spécifique
export async function saveBudgetForMonth(monthKey: string, budget: Budget): Promise<void> {
  try {
    const budgetsString = await AsyncStorage.getItem(BUDGETS_KEY);
    const budgets = budgetsString ? JSON.parse(budgetsString) : {};
    
    budgets[monthKey] = budget;
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du budget:', error);
    throw error;
  }
} 