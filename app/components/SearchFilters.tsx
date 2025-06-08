import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { Search, Filter, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllCategories } from '@/app/lib/storage';
import { formatDate } from '@/app/lib/formatting';
import { Category } from '@/app/lib/types';

export interface SearchFilters {
  searchTerm: string;
  startDate: Date | null;
  endDate: Date | null;
  selectedCategories: string[];
  minAmount: string;
  maxAmount: string;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearchChange = (text: string) => {
    onFiltersChange({ ...filters, searchTerm: text });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      onFiltersChange({ ...filters, startDate: selectedDate });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      onFiltersChange({ ...filters, endDate: selectedDate });
    }
  };

  const toggleCategory = (categoryId: string) => {
    const selectedCategories = filters.selectedCategories.includes(categoryId)
      ? filters.selectedCategories.filter(id => id !== categoryId)
      : [...filters.selectedCategories, categoryId];
    onFiltersChange({ ...filters, selectedCategories });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      startDate: null,
      endDate: null,
      selectedCategories: [],
      minAmount: '',
      maxAmount: '',
    });
    setShowFilters(false);
  };

  const hasActiveFilters = () => {
    return filters.startDate !== null ||
           filters.endDate !== null ||
           filters.selectedCategories.length > 0 ||
           filters.minAmount !== '' ||
           filters.maxAmount !== '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des reçus..."
          value={filters.searchTerm}
          onChangeText={handleSearchChange}
          left={<TextInput.Icon icon={() => <Search size={20} color="#8E8E93" />} />}
          mode="outlined"
        />
        <TouchableOpacity 
          style={[
            styles.filterButton,
            hasActiveFilters() && styles.filterButtonActive
          ]} 
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={hasActiveFilters() ? "#FFFFFF" : "#007AFF"} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Période</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text>{filters.startDate ? formatDate(filters.startDate) : 'Date début'}</Text>
                </TouchableOpacity>
                <Text>à</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text>{filters.endDate ? formatDate(filters.endDate) : 'Date fin'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Catégories</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category: Category) => (
                  <Chip
                    key={category.id}
                    selected={filters.selectedCategories.includes(category.id)}
                    onPress={() => toggleCategory(category.id)}
                    style={[
                      styles.categoryChip,
                      filters.selectedCategories.includes(category.id) && {
                        backgroundColor: category.color + '20'
                      }
                    ]}
                    textStyle={{
                      color: filters.selectedCategories.includes(category.id) 
                        ? category.color 
                        : '#000000'
                    }}
                  >
                    {category.name}
                  </Chip>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Montant</Text>
              <View style={styles.amountContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Min"
                  value={filters.minAmount}
                  onChangeText={(text) => onFiltersChange({ ...filters, minAmount: text })}
                  keyboardType="numeric"
                  mode="outlined"
                />
                <Text>à</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChangeText={(text) => onFiltersChange({ ...filters, maxAmount: text })}
                  keyboardType="numeric"
                  mode="outlined"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button mode="outlined" onPress={clearFilters}>
                Réinitialiser
              </Button>
              <Button mode="contained" onPress={() => setShowFilters(false)}>
                Appliquer
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {showStartDatePicker && (
        <DateTimePicker
          value={filters.startDate || new Date()}
          mode="date"
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={filters.endDate || new Date()}
          mode="date"
          onChange={handleEndDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
}); 