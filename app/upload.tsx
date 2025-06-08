import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, Image as ImageIcon, FileText } from 'lucide-react-native';
import { processReceipt } from '@/app/lib/receipt-processing';
import HeaderBar from '@/app/components/HeaderBar';

export default function UploadScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const receiptResult = await processReceipt(result.assets[0].uri);
        if (receiptResult) {
          const encodedData = btoa(JSON.stringify(receiptResult));
          router.push({
            pathname: '/receipt-confirmation',
            params: { 
              receiptData: encodedData,
              mode: 'new'
            }
          });
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentPick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const receiptResult = await processReceipt(result.assets[0].uri);
        if (receiptResult) {
          const encodedData = btoa(JSON.stringify(receiptResult));
          router.push({
            pathname: '/receipt-confirmation',
            params: { 
              receiptData: encodedData,
              mode: 'new'
            }
          });
        }
      }
    } catch (err) {
      console.error('Error picking document:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Upload Receipt" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Choose Upload Method</Text>
        <Text style={styles.subtitle}>Select an image or document containing your receipt</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleImagePick}
            disabled={isLoading}
          >
            <View style={styles.iconContainer}>
              <ImageIcon size={32} color="#007AFF" />
            </View>
            <Text style={styles.buttonText}>Upload Image</Text>
            <Text style={styles.buttonSubtext}>JPG, PNG</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleDocumentPick}
            disabled={isLoading}
          >
            <View style={styles.iconContainer}>
              <FileText size={32} color="#007AFF" />
            </View>
            <Text style={styles.buttonText}>Upload Document</Text>
            <Text style={styles.buttonSubtext}>PDF</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing your receipt...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
}); 