export default {
  expo: {
    name: 'ReceiptScanner',
    slug: 'receipt-scanner',
    version: '2.2.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourcompany.receiptscanner'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.yourcompany.receiptscanner'
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro'
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: "L'application a besoin d'accéder à votre caméra pour scanner les reçus."
        }
      ],
      'expo-router'
    ],
    scheme: 'receiptscanner',
    extra: {
      openAiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
      googleCloudApiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY || ''
    }
  }
};