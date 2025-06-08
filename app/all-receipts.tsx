import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import HeaderBar from '@/app/components/HeaderBar';
import ReceiptCard from '@/app/components/ReceiptCard';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/app/components/SearchFilters';
import { getReceipts } from '@/app/lib/storage';
import { Receipt } from '@/app/lib/types';

export default function AllReceiptsScreen() {
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

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.company.toLowerCase().includes(searchLower) ||
        receipt.items.some(item => 
          item.name.toLowerCase().includes(searchLower)
        )
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

    // Sort receipts by date, most recent first
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredReceipts(filtered);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Aucun reçu ne correspond à vos critères de recherche
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBar title="Tous les reçus" showBackButton />
      
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
    backgroundColor: '#F9F9FB',
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
    color: '#8E8E93',
    textAlign: 'center',
  },
}); 