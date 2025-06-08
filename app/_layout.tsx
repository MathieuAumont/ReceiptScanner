import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { ThemeProvider, useTheme } from '@/app/themes/ThemeContext';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { Portal } from 'react-native-paper';

function useFrameworkReady() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);
}

function AppContent() {
  const { theme, isDarkMode } = useTheme();
  
  const paperTheme = {
    ...isDarkMode ? MD3DarkTheme : MD3LightTheme,
    colors: {
      ...isDarkMode ? MD3DarkTheme.colors : MD3LightTheme.colors,
      primary: theme.accent,
      secondary: theme.textSecondary,
      background: theme.background,
      surface: theme.card,
      text: theme.text,
      error: theme.error,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <Portal.Host>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { 
              backgroundColor: theme.background,
              paddingTop: Platform.OS === 'ios' ? 47 : 24 
            }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="pages" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </Stack>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </Portal.Host>
    </PaperProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}