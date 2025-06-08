import { Category } from './types';

export const defaultCategories: Category[] = [
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#FF6B6B'
  },
  {
    id: 'food',
    name: 'Alimentation',
    icon: '☕',
    color: '#4ECDC4'
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: '#45B7D1'
  },
  {
    id: 'entertainment',
    name: 'Loisirs',
    icon: '🎮',
    color: '#96CEB4'
  },
  {
    id: 'health',
    name: 'Santé',
    icon: '❤️',
    color: '#FF7F50'
  },
  {
    id: 'home',
    name: 'Maison',
    icon: '🏠',
    color: '#9B59B6'
  }
];

// Ajout d'un export par défaut vide pour éviter que le fichier soit traité comme une route
export default {}; 