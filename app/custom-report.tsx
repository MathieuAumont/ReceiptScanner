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

  React.useEffect(() => {
    loadReceipts();
  }, [startDate, endDate, selectedCategories]);

  const loadReceipts = async () => {
    try {
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
    });
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
      .map(([month, value]) => ({
        label: month,
        value
      }));
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'Rapport personnalisé',
          headerShown: false,
        }}
      />
      <HeaderBar title="Rapport personnalisé" />
      
      <ScrollView style={styles.scrollView}>
        <View style={[styles.filterContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.filterTitle, { color: theme.text }]}>
            Période
          </Text>
          <View style={styles.dateContainer}>
            <Button
              mode="outlined"
              onPress={() => setShowStartPicker(true)}
              style={styles.dateButton}
            >
              {startDate.toLocaleDateString()}
            </Button>
            <Text style={{ color: theme.text }}>à</Text>
            <Button
              mode="outlined"
              onPress={() => setShowEndPicker(true)}
              style={styles.dateButton}
            >
              {endDate.toLocaleDateString()}
            </Button>
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

          <Text style={[styles.filterTitle, { color: theme.text, marginTop: 16 }]}>
            Catégories
          </Text>
          <View style={styles.categoriesContainer}>
            {defaultCategories.map(category => (
              <Button
                key={category.id}
                mode={selectedCategories.includes(category.id) ? "contained" : "outlined"}
                onPress={() => toggleCategory(category.id)}
                style={styles.categoryButton}
              >
                {category.name}
              </Button>
            ))}
          </View>
        </View>

        {receipts.length > 0 ? (
          <>
            <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Dépenses par catégorie
              </Text>
              <View style={styles.chartWrapper}>
                <PieChartComponent data={preparePieChartData()} />
              </View>
            </View>

            <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Dépenses mensuelles
              </Text>
              <View style={styles.chartWrapper}>
                <BarChartComponent data={prepareBarChartData()} />
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Aucune dépense trouvée pour cette période
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
  filterContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateButton: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    marginBottom: 8,
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
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 