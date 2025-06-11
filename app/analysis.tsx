import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import HeaderBar from '@/app/components/HeaderBar';
import { analyzeSpendingData } from '@/app/lib/openai';
import { Send } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function AnalysisScreen() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!question.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await analyzeSpendingData(question);
      setAnswer(response);
    } catch (err) {
      console.error('Error analyzing data:', err);
      setError(err instanceof Error ? err.message : (language === 'fr' ? 'Une erreur est survenue' : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const getExamples = () => {
    if (language === 'fr') {
      return [
        '• Quel est mon total de dépenses ce mois-ci ?',
        '• Dans quelle catégorie ai-je le plus dépensé ?',
        '• Comparez mes dépenses des 3 derniers mois'
      ];
    } else {
      return [
        '• What is my total spending this month?',
        '• Which category did I spend the most on?',
        '• Compare my spending over the last 3 months'
      ];
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t.spendingAnalysis,
          headerShown: false,
        }}
      />
      <HeaderBar title={t.spendingAnalysis} showBackButton />
      
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t.askQuestion}
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t.examples}
        </Text>
        <View style={styles.examplesContainer}>
          {getExamples().map((example, index) => (
            <Text key={index} style={[styles.example, { color: theme.textSecondary }]}>
              {example}
            </Text>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder={language === 'fr' ? "Posez votre question ici..." : "Ask your question here..."}
            placeholderTextColor={theme.textSecondary}
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.accent },
              (!question.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleAnalyze}
            disabled={!question.trim() || isLoading}
          >
            <Send size={24} color="white" />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              {t.analyzing}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {answer && !isLoading && (
          <View style={[styles.answerContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.answerText, { color: theme.text }]}>
              {answer}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  examplesContainer: {
    marginBottom: 24,
  },
  example: {
    fontSize: 14,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  answerContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 24,
  },
});