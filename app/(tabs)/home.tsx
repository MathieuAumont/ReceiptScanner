import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import ReceiptCard from '@/app/components/ReceiptCard';
import HeaderBar from '@/app/components/HeaderBar';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/app/components/SearchFilters';
import { getRecentReceipts, getTotalSpending, getBudgetForMonth } from '@/app/lib/storage';
import { formatCurrency } from '@/app/lib/formatting';
import { useIsFocused } from '@react-navigation/native';
import { Receipt } from '@/app/lib/types';
import { useTheme } from '@/app/themes/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({
    searchTerm: '',
    startDate: null,
    endDate: null,
    selectedCategories: [],
    minAmount: '',
    maxAmount: '',
  });
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, recentReceipts, loading]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const receipts = await getRecentReceipts(5);
      setRecentReceipts(receipts);
      
      // Get current month in YYYY-MM format
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const budget = await getBudgetForMonth(monthKey);
      setMonthlyBudget(budget.total || 0);
      
      // Calculate monthly spending (this month)
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthly = await getTotalSpending(firstDay, lastDay);
      setMonthlySpending(monthly || 0);

      // Load total budget from all categories
      const storedBudget = await AsyncStorage.getItem(`budget_${monthKey}`);
      if (storedBudget) {
        const budgetItems = JSON.parse(storedBudget);
        const total = budgetItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
        setTotalBudget(total);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      setMonthlyBudget(0);
      setMonthlySpending(0);
      setTotalBudget(0);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recentReceipts];

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.company.toLowerCase().includes(searchLower) ||
        receipt.items.some(item => 
          item.name.toLowerCase().includes(searchLower)
        ) ||
        receipt.category.toLowerCase().includes(searchLower) ||
        new Date(receipt.date).toLocaleDateString().includes(searchLower)
      );
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.date) >= filters.startDate!
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.date) <= filters.endDate!
      );
    }

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(receipt =>
        filters.selectedCategories.includes(receipt.category)
      );
    }

    // Apply amount range filter
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter(receipt => receipt.totalAmount >= minAmount);
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter(receipt => receipt.totalAmount <= maxAmount);
    }

    // Sort by date, most recent first
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredReceipts(filtered);
  };

  const renderReceipts = () => {
    const receiptsToShow = filters.searchTerm || filters.startDate || filters.endDate || 
      filters.selectedCategories.length > 0 || filters.minAmount || filters.maxAmount
      ? filteredReceipts
      : recentReceipts;

    if (receiptsToShow.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Clock size={48} color="#8E8E93" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Aucun reçu</Text>
          <Text style={styles.emptySubtitle}>
            Commencez par scanner un reçu ou en ajouter un manuellement
          </Text>
        </View>
      );
    }

    return receiptsToShow.map((receipt) => (
      <ReceiptCard 
        key={receipt.id} 
        receipt={receipt}
      />
    ));
  };

  const handleSeeAllPress = () => {
    router.push('/all-receipts');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <HeaderBar title="Receipt Scanner" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Receipt Scanner" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.statsContainer, { backgroundColor: theme.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Budget Total
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatCurrency(totalBudget, 'CAD')}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Dépenses du mois
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatCurrency(monthlySpending, 'CAD')}
            </Text>
          </View>
        </View>
        
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Reçus récents
          </Text>
          <TouchableOpacity onPress={handleSeeAllPress}>
            <Text style={[styles.seeAllText, { color: theme.text }]}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {renderReceipts()}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});