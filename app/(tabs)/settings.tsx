import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Database, Trash2, CircleHelp as HelpCircle, FileText, Moon, Bell, Share2, Info, ChevronRight, Globe } from 'lucide-react-native';
import HeaderBar from '@/app/components/HeaderBar';
import { clearAllData, exportData, getStorageSize } from '@/app/lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [storageUsed, setStorageUsed] = useState('0 KB');
  const [notifications, setNotifications] = useState(true);
  
  useEffect(() => {
    getStorageSize().then(size => {
      setStorageUsed(size);
    });
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const { notifications } = JSON.parse(settings);
        setNotifications(notifications ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        notifications
      };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      t.confirmDelete,
      language === 'fr' 
        ? 'Êtes-vous sûr de vouloir supprimer tous les reçus et paramètres ? Cette action ne peut pas être annulée.'
        : 'Are you sure you want to delete all receipts and settings? This action cannot be undone.',
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert(t.success, language === 'fr' ? 'Toutes les données ont été effacées' : 'All data has been cleared');
              setStorageUsed('0 KB');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert(t.error, language === 'fr' ? 'Impossible d\'effacer les données' : 'Failed to clear data');
            }
          },
        },
      ]
    );
  };
  
  const handleExportData = async () => {
    try {
      const exported = await exportData();
      if (exported) {
        Alert.alert(t.success, language === 'fr' ? 'Données exportées avec succès' : 'Data exported successfully');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert(t.error, language === 'fr' ? 'Impossible d\'exporter les données' : 'Failed to export data');
    }
  };

  const handleHelpPress = () => {
    router.push('/help-support');
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLanguage);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title={t.settings} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.preferences}</Text>

          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Moon size={20} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t.darkMode}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Bell size={20} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t.notifications}</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => {
                setNotifications(value);
                saveSettings();
              }}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Globe size={20} color={theme.text} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{t.language}</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  {language === 'fr' ? 'Français' : 'English'}
                </Text>
              </View>
            </View>
            <Switch
              value={language === 'en'}
              onValueChange={handleLanguageToggle}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.dataManagement}</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Database size={20} color={theme.text} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{t.storageUsed}</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{storageUsed}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]} 
            onPress={handleExportData}
          >
            <View style={styles.settingLabelContainer}>
              <FileText size={20} color="#007AFF" style={styles.settingIcon} />
              <Text style={styles.settingLabelBlue}>{t.exportData}</Text>
            </View>
            <ChevronRight size={20} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]} 
            onPress={handleClearData}
          >
            <View style={styles.settingLabelContainer}>
              <Trash2 size={20} color="#FF3B30" style={styles.settingIcon} />
              <Text style={styles.settingLabelRed}>{t.clearAllData}</Text>
            </View>
            <ChevronRight size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.about}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={handleHelpPress}
          >
            <View style={styles.settingLabelContainer}>
              <HelpCircle size={20} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t.helpSupport}</Text>
            </View>
            <ChevronRight size={20} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t.version}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>1.0.0</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Receipt Scanner App © {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 16,
    marginTop: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },
  settingLabelBlue: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#007AFF',
  },
  settingLabelRed: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#FF3B30',
  },
  settingSubtitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  settingValue: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
  },
});