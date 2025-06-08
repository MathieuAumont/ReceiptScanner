import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, ActivityIndicator, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import ReceiptForm from '@/app/components/ReceiptForm';
import { Receipt, Category } from '@/app/lib/types';
import { saveReceipt, updateReceipt, getAllCategories } from '@/app/lib/storage';
import { generateId } from '@/app/lib/helpers';
import { defaultCategories } from '@/app/lib/categories';

function base64Decode(str: string): string {
  try {
    return atob(str);
  } catch (e) {
    console.error('Error decoding base64:', e);
    return str;
  }
}

interface RawProduct {
  id?: string;
  name: string;
  price: number | string;
  quantity: number | string;
}

interface RawReceipt {
  id: string;
  company: string;
  date: string;
  products?: RawProduct[];
  items?: RawProduct[];
  subtotal: number | string;
  totalAmount: number | string;
  taxes: {
    tps: number | string;
    tvq: number | string;
  };
  category: string;
  currency: string;
  paymentMethod: string;
  metadata: {
    processedAt: string;
    ocrEngine: string;
    version: string;
    confidence: number;
    originalText?: string;
  };
}

function parseReceipt(data: RawReceipt): Receipt {
  // Utiliser items s'il existe, sinon products, sinon un tableau vide
  const products = data.items || data.products || [];
  
  return {
    ...data,
    date: new Date(data.date),
    items: products.map(product => ({
      id: product.id || generateId(),
      name: product.name,
      price: Number(product.price),
      quantity: Number(product.quantity)
    })),
    subtotal: Number(data.subtotal),
    totalAmount: Number(data.totalAmount),
    taxes: {
      tps: Number(data.taxes.tps),
      tvq: Number(data.taxes.tvq)
    },
    metadata: {
      ...data.metadata,
      processedAt: new Date(data.metadata.processedAt)
    }
  };
}

export default function ReceiptConfirmationScreen() {
  const params = useLocalSearchParams();
  const isEdit = params?.mode === 'edit';
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    // Charger les catégories au montage
    const loadCategories = async () => {
      try {
        const savedCategories = await getAllCategories();
        if (savedCategories && savedCategories.length > 0) {
          setCategories(savedCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const [receipt, setReceipt] = useState<Receipt | null>(() => {
    if (typeof params?.receiptData !== 'string') {
      console.log('No receiptData found in params');
      return null;
    }
    
    try {
      const decodedData = base64Decode(params.receiptData);
      const rawReceipt = JSON.parse(decodedData) as RawReceipt;
      const parsedReceipt = parseReceipt(rawReceipt);
      
      if (!isEdit) {
        parsedReceipt.id = generateId();
      }
      
      console.log('Successfully parsed receipt:', parsedReceipt);
      return parsedReceipt;
    } catch (error) {
      console.error('Error parsing receipt:', error);
      return null;
    }
  });

  const handleSave = async (updatedReceipt: Receipt) => {
    try {
      if (isEdit) {
        await updateReceipt(updatedReceipt);
      } else {
        await saveReceipt(updatedReceipt);
      }
      router.replace('/');
    } catch (error) {
      console.error('Error saving receipt:', error);
    }
  };

  // Debug log
  console.log('Current params:', params);
  console.log('Current receipt state:', receipt);

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text>Aucun reçu à afficher</Text>
        <Button 
          mode="contained" 
          onPress={() => router.replace('/')}
          style={styles.saveButton}
        >
          Retour
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.content}>
        <ReceiptForm 
          initialReceipt={receipt}
          categories={categories}
          onUpdateCategories={setCategories}
          onSave={handleSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  errorText: {
    color: 'red',
    margin: 16,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  }
}); 