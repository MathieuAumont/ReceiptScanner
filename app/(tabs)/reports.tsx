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
import { ChartLine as LineChart, Calendar, TrendingUp, ChartBar as BarChart3 } from 'lucide-react-native';
import { formatCurrency } from '@/app/lib/formatting';

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
  const categoryTotals = receipts.reduce((acc, receipt) => {
    const category = receipt.category;
    acc[category] = (acc[category] || 0) + receipt.totalAmount;
    return acc;
  }, {} as { [key: string]: number });

  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

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
      percentage: total > 0 ? (amount / total) * 100 : 0
    };
  }).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);
}

function prepareBarChartData(receipts: Receipt[]): BarChartData[] {
  const monthlyTotals = receipts.reduce((acc, receipt) => {
    const date = new Date(receipt.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + receipt.totalAmount;
    return acc;
  }, {} as { [key: string]: number });

  return Object.entries(monthlyTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6) // Derniers 6 mois
    .map(([month, value]) => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      const shortLabel = date.toLocaleDateString('fr-CA', { month: 'short' });
      return {
        label: shortLabel,
        value
      };
    });
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <HeaderBar title="Rapports" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Chargement des données...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <HeaderBar title="Rapports" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  const pieChartData = preparePieChartData(receipts);
  const barChartData = prepareBarChartData(receipts);
  const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Rapports" />
      
      {/* Summary Stats */}
      <View style={[styles.summaryContainer, { backgroundColor: theme.card }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Total des dépenses
          </Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>
            {formatCurrency(totalSpent, 'CAD')}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Nombre de reçus
          </Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {receipts.length}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.accent }]}
          onPress={handleAnalysisPress}
        >
          <View style={styles.buttonContent}>
            <TrendingUp size={20} color="white" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Analyse IA</Text>
              <Text style={styles.buttonSubtitle}>Insights personnalisés</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          onPress={handleCustomReportPress}
        >
          <View style={styles.buttonContent}>
            <Calendar size={20} color="white" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Rapport Custom</Text>
              <Text style={styles.buttonSubtitle}>Période personnalisée</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pie Chart Section */}
        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
          <View style={styles.chartHeader}>
            <BarChart3 size={20} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Répartition par catégorie
            </Text>
          </View>
          
          {pieChartData.length > 0 ? (
            <>
              <View style={styles.chartWrapper}>
                <PieChartComponent data={pieChartData} />
              </View>
              
              {/* Category Legend */}
              <View style={styles.legendContainer}>
                {pieChartData.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendText, { color: theme.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.legendAmount, { color: theme.textSecondary }]}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Aucune donnée disponible
              </Text>
            </View>
          )}
        </View>

        {/* Bar Chart Section */}
        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
          <View style={styles.chartHeader}>
            <LineChart size={20} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Évolution mensuelle
            </Text>
          </View>
          
          {barChartData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <BarChartComponent data={barChartData} />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Aucune donnée disponible
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  buttonTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chartContainer: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
  },
  legendAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});