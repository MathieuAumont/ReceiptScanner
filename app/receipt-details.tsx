import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Trash2, Edit2, Image as ImageIcon } from 'lucide-react-native';
import HeaderBar from '@/app/components/HeaderBar';
import { getReceiptById, deleteReceipt, getAllCategories } from '@/app/lib/storage';
import { formatCurrency, formatDate } from '@/app/lib/formatting';
import { defaultCategories } from '@/app/lib/categories';
import { Receipt, Category } from '@/app/lib/types';
import { generateId } from '@/app/lib/helpers';
import { useTheme } from '@/app/themes/ThemeContext';

export default function ReceiptDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    loadReceipt();
    loadCategories();
  }, [id]);

  const loadReceipt = async () => {
    if (!id) {
      router.back();
      return;
    }
    
    try {
      setLoading(true);
      const receiptData = await getReceiptById(id as string);
      
      if (!receiptData) {
        Alert.alert('Error', 'Receipt not found');
        router.back();
        return;
      }

      if (typeof receiptData !== 'object') {
        throw new Error('Invalid receipt data format');
      }

      const normalizedReceipt: Receipt = {
        ...receiptData,
        date: new Date(receiptData.date),
        items: Array.isArray(receiptData.items) 
          ? receiptData.items.map(item => ({
              ...item,
              id: item.id || generateId()
            }))
          : [],
        taxes: {
          tps: receiptData.taxes?.tps || 0,
          tvq: receiptData.taxes?.tvq || 0
        },
        subtotal: receiptData.subtotal || 0,
        totalAmount: receiptData.totalAmount || 0
      };
      
      setReceipt(normalizedReceipt);
    } catch (error) {
      console.error('Error loading receipt:', error);
      Alert.alert('Error', 'Failed to load receipt details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category?.name || 'Non catégorisé';
  };

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category?.color || '#999999';
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!id) return;
              await deleteReceipt(id as string);
              router.replace('/');
            } catch (error) {
              console.error('Error deleting receipt:', error);
              Alert.alert('Error', 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (receipt) {
      router.push({
        pathname: '/receipt-edit',
        params: { id: receipt.id }
      });
    }
  };

  const handleViewImage = () => {
    if (receipt?.metadata?.originalText) {
      router.push({
        pathname: '/receipt-image',
        params: { imageUri: receipt.metadata.originalText }
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Chargement...</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>Reçu non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar 
        title="Détails du reçu" 
        showBackButton
      />
      
      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Date</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatDate(receipt.date)}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Magasin</Text>
          <Text style={[styles.value, { color: theme.text }]}>{receipt.company}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Catégorie</Text>
          <View style={styles.categoryTag}>
            <Text style={[styles.categoryText, { color: theme.text }]}>
              {getCategoryName(receipt.category)}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Articles</Text>
          {receipt.items.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.productQuantity, { color: theme.textSecondary }]}>x{item.quantity}</Text>
              </View>
              <Text style={[styles.productPrice, { color: theme.text }]}>
                {formatCurrency(item.price * item.quantity, receipt.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.totalLine}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Sous-total</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{formatCurrency(receipt.subtotal, receipt.currency)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>TPS (5%)</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{formatCurrency(receipt.taxes.tps || 0, receipt.currency)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>TVQ (9.975%)</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{formatCurrency(receipt.taxes.tvq || 0, receipt.currency)}</Text>
          </View>
          <View style={[styles.totalLine, styles.finalTotal]}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
            <Text style={[styles.finalTotalValue, { color: theme.text }]}>{formatCurrency(receipt.totalAmount, receipt.currency)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={handleEdit}
          >
            <Edit2 size={24} color={theme.accent} />
            <Text style={[styles.actionButtonText, { color: theme.accent }]}>Modifier</Text>
          </TouchableOpacity>

          {receipt.metadata?.originalText && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.card }]}
              onPress={handleViewImage}
            >
              <ImageIcon size={24} color="#4CAF50" />
              <Text style={styles.imageButtonText}>Voir l'image</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={handleDelete}
          >
            <Trash2 size={24} color={theme.error} />
            <Text style={[styles.actionButtonText, { color: theme.error }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 14,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 16,
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  imageButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});