import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton, Portal, Modal } from 'react-native-paper';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';
import { categories } from '@/app/lib/categories';

const PRESET_COLORS = [
  '#007AFF', // Bleu
  '#4CAF50', // Vert
  '#FF9800', // Orange
  '#9C27B0', // Violet
  '#F44336', // Rouge
  '#795548', // Marron
  '#00BCD4', // Cyan
  '#FF4081', // Rose
  '#8BC34A', // Vert clair
  '#FFC107', // Jaune
  '#673AB7', // Violet foncé
  '#FF5722', // Orange foncé
];

export interface Category {
  id: string;
  name: string;
  color: string;
  isCustom?: boolean;
}

interface CategoryManagerProps {
  onCategoryChange: (categories: Category[]) => void;
}

export default function CategoryManager({ onCategoryChange }: CategoryManagerProps) {
  const [allCategories, setAllCategories] = useState<Category[]>(categories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setSelectedColor(PRESET_COLORS[0]);
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedColor(category.color);
    setShowModal(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = allCategories.filter(cat => cat.id !== categoryId);
    setAllCategories(updatedCategories);
    onCategoryChange(updatedCategories);
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) return;

    const updatedCategories = [...allCategories];
    const newCategory = {
      id: editingCategory?.id || `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      color: selectedColor,
      isCustom: true,
    };

    if (editingCategory) {
      const index = updatedCategories.findIndex(cat => cat.id === editingCategory.id);
      if (index !== -1) {
        updatedCategories[index] = newCategory;
      }
    } else {
      updatedCategories.push(newCategory);
    }

    setAllCategories(updatedCategories);
    onCategoryChange(updatedCategories);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catégories</Text>
        <IconButton
          icon={() => <Plus size={24} color="#007AFF" />}
          onPress={handleAddCategory}
        />
      </View>

      <ScrollView style={styles.categoryList}>
        {allCategories.map(category => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View 
                style={[
                  styles.colorDot,
                  { backgroundColor: category.color }
                ]} 
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            
            <View style={styles.actions}>
              <IconButton
                icon={() => <Edit2 size={20} color="#007AFF" />}
                onPress={() => handleEditCategory(category)}
              />
              {category.isCustom && (
                <IconButton
                  icon={() => <Trash2 size={20} color="#FF3B30" />}
                  onPress={() => handleDeleteCategory(category.id)}
                />
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>
            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </Text>
          
          <TextInput
            label="Nom de la catégorie"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            style={styles.input}
          />

          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorLabel}>Couleur</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setShowModal(false)}
              style={styles.button}
            >
              Annuler
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSaveCategory}
              style={styles.button}
            >
              Enregistrer
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  colorPickerContainer: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
}); 