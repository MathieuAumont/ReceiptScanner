import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getReceipts } from './storage';
import { Receipt, Category } from './types';
import { defaultCategories } from './categories';
import { formatDate, formatCurrency } from './formatting';

const createCSV = (receipts: Receipt[]): string => {
  // En-têtes CSV
  const headers = [
    'Date',
    'Magasin',
    'Montant total',
    'Catégorie',
    'Notes',
    'Articles',
    'TPS',
    'TVQ',
    'Sous-total',
  ].join(',');

  // Lignes de données
  const rows = receipts.map(receipt => {
    const category = defaultCategories.find((c: Category) => c.id === receipt.category)?.name || '';
    const items = receipt.items
      .map(item => `${item.name} (${item.quantity}x${formatCurrency(item.price, 'CAD')})`)
      .join('; ');

    return [
      formatDate(new Date(receipt.date)),
      receipt.company.replace(/,/g, ' '),
      formatCurrency(receipt.totalAmount, 'CAD'),
      category,
      (receipt.notes || '').replace(/,/g, ' '),
      items.replace(/,/g, ' '),
      formatCurrency(receipt.taxes.tps, 'CAD'),
      formatCurrency(receipt.taxes.tvq, 'CAD'),
      formatCurrency(receipt.subtotal, 'CAD'),
    ].join(',');
  });

  return [headers, ...rows].join('\n');
};

export const exportToCSV = async (): Promise<void> => {
  try {
    const receipts = await getReceipts();
    const csv = createCSV(receipts);
    
    const fileName = `receipts_${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Exporter les reçus',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const exportToPDF = async (): Promise<void> => {
  // TODO: Implémenter l'export PDF
  throw new Error('Export PDF pas encore implémenté');
};

export default {
  exportToCSV,
  exportToPDF,
}; 