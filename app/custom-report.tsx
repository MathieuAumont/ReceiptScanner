import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTheme } from '@/app/themes/ThemeContext';
import HeaderBar from '@/app/components/HeaderBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getReceipts } from '@/app/lib/storage';
import { Receipt } from '@/app/lib/types';
import { defaultCategories } from '@/app/lib/categories';
import PieChartComponent from '@/app/components/PieChartComponent';
import BarChartComponent from '@/app/components/BarChartComponent';
import { Stack } from 'expo-router';
import { formatCurrency } from '@/app/lib/formatting';
import { Calendar, Filter, TrendingUp, PieChart } from 'lucide-react-native';

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

export default function CustomReportScreen() {
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadReceipts();
  }, [startDate, endDate, selectedCategories]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const allReceipts = await getReceipts();
      const filteredReceipts = allReceipts.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        const isInDateRange = receiptDate >= startDate && receiptDate <= endDate;
        const isInSelectedCategories = selectedCategories.length === 0 || 
          selectedCategories.includes(receipt.category);
        return isInDateRange && isInSelectedCategories;
      });
      setReceipts(filteredReceipts);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const preparePieChartData = (): PieChartData[] => {
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
        percentage: (amount / total) * 100
      };
    }).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);
  };

  const prepareBarChartData = (): BarChartData[] => {
    const monthlyTotals = receipts.reduce((acc, receipt) => {
      const date = new Date(receipt.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + receipt.totalAmount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(monthlyTotals)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, value]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        const shortLabel = date.toLocaleDateString('fr-CA', { month: 'short' });
        return {
          label: shortLabel,
          value
        };
      });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
  const pieChartData = preparePieChartData();
  const barChartData = prepareBarChartData();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'Rapport personnalisé',
          headerShown: false,
        }}
      />
      <HeaderBar title="Rapport personnalisé" showBackButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <View style={styles.summaryHeader}>
            <TrendingUp size={20} color={theme.accent} />
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              Résumé de la période
            </Text>
          </View>
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryAmount, { color: theme.accent }]}>
              {formatCurrency(totalAmount, 'CAD')}
            </Text>
            <Text style={[styles.summarySubtext, { color: theme.textSecondary }]}>
              {receipts.length} reçu{receipts.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={[styles.dateRange, { color: theme.textSecondary }]}>
            Du {startDate.toLocaleDateString('fr-CA')} au {endDate.toLocaleDateString('fr-CA')}
          </Text>
        </View>

        {/* Filters Section */}
        <View style={[styles.filterSection, { backgroundColor: theme.card }]}>
          <View style={styles.filterHeader}>
            <Filter size={18} color={theme.accent} />
            <Text style={[styles.filterTitle, { color: theme.text }]}>
              Filtres de période
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Date de début</Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartPicker(true)}
                style={[styles.dateButton, { borderColor: theme.border }]}
                labelStyle={{ color: theme.text }}
                icon={() => <Calendar size={16} color={theme.accent} />}
              >
                {startDate.toLocaleDateString('fr-CA')}
              </Button>
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Date de fin</Text>
              <Button
                mode="outlined"
                onPress={() => setShowEndPicker(true)}
                style={[styles.dateButton, { borderColor: theme.border }]}
                labelStyle={{ color: theme.text }}
                icon={() => <Calendar size={16} color={theme.accent} />}
              >
                {endDate.toLocaleDateString('fr-CA')}
              </Button>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              onChange={handleStartDateChange}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              onChange={handleEndDateChange}
            />
          )}

          <Text style={[styles.categoryFilterTitle, { color: theme.text }]}>
            Catégories
          </Text>
          <View style={styles.categoriesContainer}>
            {defaultCategories.map(category => (
              <Button
                key={category.id}
                mode={selectedCategories.includes(category.id) ? "contained" : "outlined"}
                onPress={() => toggleCategory(category.id)}
                style={[
                  styles.categoryButton,
                  selectedCategories.includes(category.id) && { backgroundColor: category.color }
                ]}
                labelStyle={{
                  color: selectedCategories.includes(category.id) ? 'white' : theme.text,
                  fontSize: 12
                }}
              >
                {category.name}
              </Button>
            ))}
          </View>
        </View>

        {receipts.length > 0 ? (
          <>
            {/* Pie Chart Section */}
            <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
              <View style={styles.chartHeader}>
                <PieChart size={18} color={theme.accent} />
                <Text style={[styles.chartTitle, { color: theme.text }]}>
                  Répartition par catégorie
                </Text>
              </View>
              <View style={styles.chartWrapper}>
                <PieChartComponent data={pieChartData} />
              </View>
            </View>

            {/* Bar Chart Section */}
            <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
              <View style={styles.chartHeader}>
                <TrendingUp size={18} color={theme.accent} />
                <Text style={[styles.chartTitle, { color: theme.text }]}>
                  Évolution temporelle
                </Text>
              </View>
              <View style={styles.chartWrapper}>
                <BarChartComponent data={barChartData} />
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Aucune dépense trouvée pour cette période et ces critères
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Essayez d'ajuster vos filtres ou d'ajouter des reçus
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryContent: {
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
  },
  dateRange: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  filterSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  dateButton: {
    borderRadius: 8,
  },
  categoryFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderRadius: 20,
    marginBottom: 4,
  },
  chartContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});