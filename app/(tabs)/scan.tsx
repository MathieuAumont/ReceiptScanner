import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { processReceipt } from '@/app/lib/receipt-processing';
import { generateId, encodeBase64 } from '@/app/lib/helpers';
import { Receipt } from '@/app/lib/types';
import { Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function ScanScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [photo, setPhoto] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t.error,
          "Nous avons besoin de votre permission pour accéder à vos photos.",
          [{ text: "OK" }]
        );
      }
    })();
    requestMediaPermission();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.permissionText, { color: theme.text }]}>
          {t.language === 'fr' ? 'Permission d\'accéder à la caméra requise.' : 'Permission to access camera is required.'}
        </Text>
        <TouchableOpacity onPress={requestPermission} style={[styles.permissionButton, { backgroundColor: theme.accent }]}>
          <Text style={styles.permissionButtonText}>
            {t.language === 'fr' ? 'Accorder la permission' : 'Grant permission'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleImagePick = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const receiptResult = await processReceipt(result.assets[0].uri);
        
        if (!receiptResult) {
          throw new Error(t.language === 'fr' ? "Le traitement du reçu n'a pas retourné de données" : "Receipt processing did not return data");
        }

        if (!receiptResult.totalAmount && receiptResult.totalAmount !== 0) {
          throw new Error(t.language === 'fr' ? "Le montant total n'a pas pu être extrait du reçu" : "Total amount could not be extracted from receipt");
        }

        const safeReceiptData = {
          id: receiptResult.id || generateId(),
          company: receiptResult.company || (t.language === 'fr' ? "Entreprise inconnue" : "Unknown company"),
          date: receiptResult.date || new Date().toISOString(),
          totalAmount: receiptResult.totalAmount || 0,
          subtotal: receiptResult.subtotal || 0,
          taxes: {
            tps: receiptResult.taxes?.tps || 0,
            tvq: receiptResult.taxes?.tvq || 0
          },
          items: (receiptResult.items || []).map(item => ({
            id: item.id || generateId(),
            name: item.name || (t.language === 'fr' ? "Article inconnu" : "Unknown item"),
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1
          })),
          category: receiptResult.category || "shopping",
          currency: receiptResult.currency || "CAD",
          metadata: {
            processedAt: receiptResult.metadata?.processedAt || new Date().toISOString(),
            ocrEngine: receiptResult.metadata?.ocrEngine || "openai",
            version: receiptResult.metadata?.version || "1.0",
            confidence: receiptResult.metadata?.confidence || 0.8
          },
          originalImage: result.assets[0].uri
        };

        const encodedData = encodeBase64(JSON.stringify(safeReceiptData));
        router.push({
          pathname: '/receipt-confirmation',
          params: { 
            receiptData: encodedData,
            mode: 'new'
          }
        });
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError(err instanceof Error ? err.message : t.language === 'fr' ? 'Erreur lors du traitement de l\'image' : 'Error processing image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takePicture = async () => {
    if (!isCameraReady || !cameraRef.current) {
      setError(t.language === 'fr' ? "La caméra n'est pas encore prête" : "Camera is not ready yet");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      
      if (photo?.uri) {
        const result = await processReceipt(photo.uri);
        if (result) {
          const encodedData = encodeBase64(JSON.stringify(result));
          router.push({
            pathname: '/receipt-confirmation',
            params: { receiptData: encodedData }
          });
        }
      }
    } catch (err) {
      console.error('Error taking picture:', err);
      setError(err instanceof Error ? err.message : t.language === 'fr' ? 'Échec du traitement du reçu' : 'Failed to process receipt');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={() => {
          console.log('Camera ready');
          setIsCameraReady(true);
        }}
        onMountError={(error) => {
          console.error('Camera mount error:', error);
          setError(t.language === 'fr' ? 'Échec de l\'initialisation de la caméra' : 'Failed to initialize camera');
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImagePick}
            disabled={isAnalyzing}
          >
            <View style={styles.iconContainer}>
              <ImageIcon size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.buttonText}>{t.upload}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureButton,
              (isAnalyzing || !isCameraReady) && styles.captureButtonDisabled
            ]}
            onPress={takePicture}
            disabled={isAnalyzing || !isCameraReady}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.analyzingText}>{t.analyzing}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 25,
    gap: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});