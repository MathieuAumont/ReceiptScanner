import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HeaderBar from '@/app/components/HeaderBar';
import ReceiptForm from '@/app/components/ReceiptForm';
import { getReceiptById, updateReceipt, getAllCategories } from '@/app/lib/storage';
import { Receipt, Category } from '@/app/lib/types';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function ReceiptEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { t, language } = useLanguage();

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
        Alert.alert(t.error, t.receiptNotFound);
        router.back();
        return;
      }

      setReceipt(receiptData);
    } catch (error) {
      console.error('Error loading receipt:', error);
      Alert.alert(t.error, language === 'fr' ? 'Impossible de charger le reçu' : 'Unable to load receipt');
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
      Alert.alert(t.error, language === 'fr' ? 'Impossible de charger les catégories' : 'Unable to load categories');
    }
  };

  const handleUpdateCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
  };

  const handleSave = async (updatedReceipt: Receipt) => {
    try {
      await updateReceipt(updatedReceipt);
      router.back();
    } catch (error) {
      console.error('Error updating receipt:', error);
      Alert.alert(t.error, language === 'fr' ? 'Impossible de mettre à jour le reçu' : 'Unable to update receipt');
    }
  };

  if (loading || !receipt) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <HeaderBar title={language === 'fr' ? 'Modifier le reçu' : 'Edit Receipt'} showBackButton />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>{t.loading}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title={language === 'fr' ? 'Modifier le reçu' : 'Edit Receipt'} showBackButton />
      <View style={styles.formContainer}>
        <ReceiptForm
          initialReceipt={receipt}
          categories={categories}
          onUpdateCategories={handleUpdateCategories}
          onSave={handleSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
});