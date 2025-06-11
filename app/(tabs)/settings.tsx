import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Database, Trash2, CircleHelp as HelpCircle, FileText, Moon, Bell, Share2, Info, ChevronRight } from 'lucide-react-native';
import HeaderBar from '@/app/components/HeaderBar';
import { clearAllData, exportData, getStorageSize } from '@/app/lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/app/themes/ThemeContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [storageUsed, setStorageUsed] = useState('0 KB');
  const [notifications, setNotifications] = useState(true);
  
  useEffect(() => {
    // Get storage size on component mount
    getStorageSize().then(size => {
      setStorageUsed(size);
    });

    // Load saved settings
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
      'Clear All Data',
      'Are you sure you want to delete all receipts and settings? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared');
              setStorageUsed('0 KB');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
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
        Alert.alert('Success', 'Data exported successfully');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleHelpPress = () => {
    router.push('/help-support');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Paramètres" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>

          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Moon size={20} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
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
              <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
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
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Management</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Database size={20} color={theme.text} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Storage Used</Text>
                <Text style={[styles.settingSubtitle, { color: theme.text }]}>{storageUsed}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]} 
            onPress={handleExportData}
          >
            <View style={styles.settingLabelContainer}>
              <FileText size={20} color="#007AFF" style={styles.settingIcon} />
              <Text style={styles.settingLabelBlue}>Export Data</Text>
            </View>
            <ChevronRight size={20} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]} 
            onPress={handleClearData}
          >
            <View style={styles.settingLabelContainer}>
              <Trash2 size={20} color="#FF3B30" style={styles.settingIcon} />
              <Text style={styles.settingLabelRed}>Clear All Data</Text>
            </View>
            <ChevronRight size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={handleHelpPress}
          >
            <View style={styles.settingLabelContainer}>
              <HelpCircle size={20} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
              <Text style={[styles.settingValue, { color: theme.text }]}>1.0.0</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text }]}>
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