import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/app/themes/ThemeContext';

interface HeaderBarProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBack?: () => void;
}

export default function HeaderBar({ title, showBackButton = false, rightComponent, onBack }: HeaderBarProps) {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  return (
    <View style={[styles.header, { backgroundColor: theme.card }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
        
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        
        {rightComponent ? (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Roboto-Medium',
    fontSize: 17,
    flex: 1,
    textAlign: 'center',
  },
  rightComponent: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightPlaceholder: {
    width: 40,
  },
}); 