import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HeaderBar from '@/app/components/HeaderBar';
import ReceiptForm from '@/app/components/ReceiptForm';
import { getReceiptById, updateReceipt, getAllCategories } from '@/app/lib/storage';
import { Receipt, Category } from '@/app/lib/types';

export default function ReceiptEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
        Alert.alert('Erreur', 'Reçu non trouvé');
        router.back();
        return;
      }

      setReceipt(receiptData);
    } catch (error) {
      console.error('Error loading receipt:', error);
      Alert.alert('Erreur', 'Impossible de charger le reçu');
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
      Alert.alert('Erreur', 'Impossible de charger les catégories');
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
      Alert.alert('Erreur', 'Impossible de mettre à jour le reçu');
    }
  };

  if (loading || !receipt) {
    return (
      <View style={styles.container}>
        <HeaderBar title="Modifier le reçu" showBackButton />
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar title="Modifier le reçu" showBackButton />
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
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
  },
}); 