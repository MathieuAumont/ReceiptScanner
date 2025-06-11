import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import HeaderBar from '@/app/components/HeaderBar';
import ReceiptCard from '@/app/components/ReceiptCard';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/app/components/SearchFilters';
import { getReceipts } from '@/app/lib/storage';
import { Receipt } from '@/app/lib/types';
import { useTheme } from '@/app/themes/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AllReceiptsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      loadReceipts();
    }
  }, [isFocused]);

  useEffect(() => {
    applyFilters();
  }, [filters, receipts]);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);
      const allReceipts = await getReceipts();
      setReceipts(allReceipts);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...receipts];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.company.toLowerCase().includes(searchLower) ||
        receipt.items.some(item => 
          item.name.toLowerCase().includes(searchLower)
        )
      );
    }

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

    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(receipt =>
        filters.selectedCategories.includes(receipt.category)
      );
    }

    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter(receipt => receipt.totalAmount >= minAmount);
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter(receipt => receipt.totalAmount <= maxAmount);
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredReceipts(filtered);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {t.language === 'fr' 
          ? 'Aucun reçu ne correspond à vos critères de recherche'
          : 'No receipts match your search criteria'
        }
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title={t.language === 'fr' ? 'Tous les reçus' : 'All Receipts'} showBackButton />
      
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <FlatList
        data={filteredReceipts}
        renderItem={({ item }) => <ReceiptCard receipt={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});