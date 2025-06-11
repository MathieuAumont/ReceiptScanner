import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '@/app/themes/ThemeContext';
import HeaderBar from '@/app/components/HeaderBar';
import { Camera, Plus, BarChart3, Settings, Wallet, FileText, Smartphone, Cloud, Shield } from 'lucide-react-native';

export default function HelpSupportScreen() {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Camera size={24} color={theme.accent} />,
      title: 'Receipt Scanning',
      description: 'Use your camera to scan receipts automatically. The app uses AI to extract information like store name, date, items, and total amount.'
    },
    {
      icon: <Plus size={24} color={theme.accent} />,
      title: 'Manual Entry',
      description: 'Add receipts manually by entering store information, items, prices, and taxes. Perfect for digital receipts or when scanning is not available.'
    },
    {
      icon: <Wallet size={24} color={theme.accent} />,
      title: 'Budget Management',
      description: 'Set monthly budgets for different categories and track your spending progress with visual indicators and alerts.'
    },
    {
      icon: <BarChart3 size={24} color={theme.accent} />,
      title: 'Reports & Analytics',
      description: 'View detailed spending reports with charts showing your expenses by category and over time. Generate custom reports for specific periods.'
    },
    {
      icon: <Settings size={24} color={theme.accent} />,
      title: 'Customization',
      description: 'Create custom categories, switch between light and dark themes, and configure the app to match your preferences.'
    }
  ];

  const tips = [
    {
      icon: <Smartphone size={20} color="#4CAF50" />,
      title: 'Best Scanning Practices',
      description: 'For best results, ensure good lighting, hold the camera steady, and make sure the entire receipt is visible in the frame.'
    },
    {
      icon: <FileText size={20} color="#4CAF50" />,
      title: 'Organize Your Receipts',
      description: 'Use categories to organize your expenses. This makes it easier to track spending patterns and create meaningful reports.'
    },
    {
      icon: <Cloud size={20} color="#4CAF50" />,
      title: 'Data Backup',
      description: 'Regularly export your data from the settings menu to keep a backup of your financial records.'
    },
    {
      icon: <Shield size={20} color="#4CAF50" />,
      title: 'Privacy & Security',
      description: 'Your receipt data is stored locally on your device. The app only uses cloud services for AI processing when scanning receipts.'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Help & Support" showBackButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Overview */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            About Receipt Scanner
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Receipt Scanner is a comprehensive expense tracking app that helps you manage your finances by digitizing and organizing your receipts. 
            Use AI-powered scanning or manual entry to track expenses, set budgets, and generate insightful reports.
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Key Features
          </Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                {feature.icon}
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* How to Use */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            How to Use
          </Text>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Scan or Add Receipts</Text>
              <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Use the camera tab to scan receipts or the manual entry tab to add receipts manually.
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Review and Categorize</Text>
              <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Verify the extracted information and assign appropriate categories to your expenses.
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Set Budgets</Text>
              <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Use the budget tab to set monthly spending limits for different categories.
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Track and Analyze</Text>
              <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Monitor your spending through the reports tab and get AI-powered insights about your financial habits.
              </Text>
            </View>
          </View>
        </View>

        {/* Tips & Best Practices */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Tips & Best Practices
          </Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipIcon}>
                {tip.icon}
              </View>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: theme.text }]}>
                  {tip.title}
                </Text>
                <Text style={[styles.tipDescription, { color: theme.textSecondary }]}>
                  {tip.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Frequently Asked Questions
          </Text>
          
          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>
              Q: Is my data secure?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              A: Yes, all your receipt data is stored locally on your device. Cloud services are only used for AI processing during receipt scanning.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>
              Q: Can I export my data?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              A: Yes, you can export your data in CSV format from the Settings tab for backup or analysis in other applications.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>
              Q: What if the scanner doesn't work properly?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              A: You can always use manual entry to add receipts. Make sure you have good lighting and the receipt is clearly visible when scanning.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>
              Q: Can I create custom categories?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              A: Yes, you can create custom categories when adding or editing receipts. These will be saved for future use.
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Need More Help?
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            If you have questions that aren't covered here, or if you encounter any issues with the app, 
            please don't hesitate to reach out to our support team. We're here to help you make the most of Receipt Scanner.
          </Text>
          <Text style={[styles.contactInfo, { color: theme.accent }]}>
            support@receiptscanner.app
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
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
});