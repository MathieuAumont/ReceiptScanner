import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import HeaderBar from '@/app/components/HeaderBar';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function ReceiptImageScreen() {
  const { imageUri } = useLocalSearchParams();
  const { language } = useLanguage();

  return (
    <View style={styles.container}>
      <HeaderBar title={language === 'fr' ? 'Photo du reçu' : 'Receipt Photo'} showBackButton />
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri as string }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});