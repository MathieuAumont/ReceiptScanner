import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { processReceipt } from '@/app/lib/receipt-processing';
import { generateId } from '@/app/lib/helpers';
import { Receipt } from '@/app/lib/types';
import { Image as ImageIcon, Upload } from 'lucide-react-native';

export default function ScanScreen() {
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
    })();
    requestMediaPermission();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permission to access camera is required.</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!isCameraReady || !cameraRef.current) {
      setError("Camera is not ready yet");
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
          const encodedData = btoa(JSON.stringify(result));
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
      console.error('Error taking picture:', err);
      setError(err instanceof Error ? err.message : 'Failed to process receipt');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickImage = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const receiptResult = await processReceipt(pickerResult.assets[0].uri);
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
      setError(err instanceof Error ? err.message : 'Failed to process receipt');
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
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={takePicture}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Capture</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Upload size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
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
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
  uploadButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 30,
  },
}); 