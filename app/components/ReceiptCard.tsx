import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt, Category } from '@/app/lib/types';
import { formatCurrency, formatDate } from '@/app/lib/formatting';
import { ShoppingBag } from 'lucide-react-native';
import { getAllCategories } from '@/app/lib/storage';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress?: () => void;
}

export default function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Charger les catégories avec les traductions
    getAllCategories(t).then(setCategories);
  }, [t, language]);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category?.name || (language === 'fr' ? 'Non catégorisé' : 'Uncategorized');
  };

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category?.color || theme.textSecondary;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/receipt-details',
        params: { id: receipt.id }
      });
    }
  };

  const total = receipt.totalAmount;

  return (
    <TouchableOpacity 
      style={[styles.container, { 
        backgroundColor: theme.card,
        shadowColor: theme.text,
        borderColor: theme.border,
        borderWidth: 1,
      }]} 
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${theme.accent}20` }]}>
        <ShoppingBag size={24} color={theme.accent} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <Text style={[styles.storeName, { color: theme.text }]} numberOfLines={1}>
            {receipt.company}
          </Text>
          <Text style={[styles.amount, { color: theme.text }]}>
            {formatCurrency(total, receipt.currency)}
          </Text>
        </View>
        
        <View style={styles.details}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatDate(receipt.date)}
          </Text>
          <View style={styles.categoryContainer}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: getCategoryColor(receipt.category) }
              ]}
            />
            <Text style={[styles.category, { color: theme.textSecondary }]}>
              {getCategoryName(receipt.category)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    marginRight: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
});