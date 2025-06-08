import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '@/app/themes/ThemeContext';
import { router } from 'expo-router';
import HeaderBar from '@/app/components/HeaderBar';
import PieChartComponent from '@/app/components/PieChartComponent';
import BarChartComponent from '@/app/components/BarChartComponent';
import { getReceipts } from '@/app/lib/storage';
import { Receipt } from '@/app/lib/types';
import { defaultCategories } from '@/app/lib/categories';
import { LineChart, Calendar } from 'lucide-react-native';

interface PieChartData {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface BarChartData {
  label: string;
  value: number;
}

function preparePieChartData(receipts: Receipt[]): PieChartData[] {
  // Grouper les dépenses par catégorie
  const categoryTotals = receipts.reduce((acc, receipt) => {
    const category = receipt.category;
    acc[category] = (acc[category] || 0) + receipt.totalAmount;
    return acc;
  }, {} as { [key: string]: number });

  // Calculer le total général
  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  // Créer les données pour le graphique
  return Object.entries(categoryTotals).map(([categoryId, amount]) => {
    const category = defaultCategories.find(c => c.id === categoryId) || {
      id: 'other',
      name: 'Autre',
      color: '#999999'
    };
    return {
      id: category.id,
      name: category.name,
      amount,
      color: category.color,
      percentage: (amount / total) * 100
    };
  });
}

function prepareBarChartData(receipts: Receipt[]): BarChartData[] {
  // Grouper les dépenses par mois
  const monthlyTotals = receipts.reduce((acc, receipt) => {
    const date = new Date(receipt.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + receipt.totalAmount;
    return acc;
  }, {} as { [key: string]: number });

  // Convertir en format pour le graphique
  return Object.entries(monthlyTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({
      label: month,
      value
    }));
}

export default function ReportsScreen() {
  const { theme } = useTheme();
  const [receipts, setReceipts] = React.useState<Receipt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadReceipts = async () => {
      try {
        setLoading(true);
        const data = await getReceipts();
        setReceipts(data);
      } catch (err) {
        console.error('Error loading receipts:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    loadReceipts();
  }, []);

  const handleAnalysisPress = () => {
    router.push('/analysis');
  };

  const handleCustomReportPress = () => {
    router.push('/custom-report');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderBar title="Rapports" />
        <View style={styles.loadingContainer}>
          <Text>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <HeaderBar title="Rapports" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  const pieChartData = preparePieChartData(receipts);
  const barChartData = prepareBarChartData(receipts);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Rapports" />
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={handleAnalysisPress}
        >
          <LineChart size={24} color="white" />
          <Text style={styles.buttonText}>Analyse détaillée</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={handleCustomReportPress}
        >
          <Calendar size={24} color="white" />
          <Text style={styles.buttonText}>Rapport personnalisé</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Dépenses par catégorie
          </Text>
          <View style={styles.chartWrapper}>
            <PieChartComponent data={pieChartData} />
          </View>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Dépenses mensuelles
          </Text>
          <View style={styles.chartWrapper}>
            <BarChartComponent data={barChartData} />
          </View>
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
  chartContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 