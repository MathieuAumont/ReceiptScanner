import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Receipt, Category } from '@/app/lib/types';
import { saveReceipt, getAllCategories } from '@/app/lib/storage';
import { defaultCategories } from '@/app/lib/categories';
import ReceiptForm from '@/app/components/ReceiptForm';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function ManualEntryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [showSuccess, setShowSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [key, setKey] = useState(0);

  useEffect(() => {
    loadCategories();
    
    // Add listener for navigation events
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      handleReset();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCategories = async () => {
    try {
      const allCategories = await getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(defaultCategories);
    }
  };

  const handleUpdateCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
  };

  const handleReset = () => {
    setKey(prevKey => prevKey + 1);
  };

  const handleSave = async (receiptData: Receipt) => {
    try {
      await saveReceipt(receiptData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error saving receipt:', error);
      Alert.alert(t.error, t.errorSavingReceipt);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {showSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{t.receiptSavedSuccessfully}</Text>
          </View>
        )}
        <View style={styles.formContainer}>
          <ReceiptForm
            key={key}
            categories={categories}
            onUpdateCategories={handleUpdateCategories}
            onSave={handleSave}
            onReset={handleReset}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  formContainer: {
    flex: 1,
  },
  successMessage: {
    backgroundColor: '#34C759',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});