import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MessageSquare, RefreshCw } from 'lucide-react-native';
import { generateAIInsight } from '@/app/lib/ai';

export default function AIInsightCard() {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadInsight = async () => {
    setLoading(true);
    try {
      const newInsight = await generateAIInsight();
      setInsight(newInsight);
    } catch (error) {
      console.error('Error loading AI insight:', error);
      setInsight('Unable to generate insight at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsight();
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MessageSquare size={20} color="#007AFF" />
          <Text style={styles.title}>AI Insights</Text>
        </View>
        <TouchableOpacity onPress={loadInsight} disabled={loading}>
          <RefreshCw size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.insightText}>{insight}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    minHeight: 60,
    justifyContent: 'center',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
});