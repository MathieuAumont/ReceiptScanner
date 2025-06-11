import { Category } from './types';
import { useLanguage } from '@/app/contexts/LanguageContext';

export const getDefaultCategories = (t: any): Category[] => [
  {
    id: 'shopping',
    name: t.shopping,
    icon: '🛍️',
    color: '#FF6B6B'
  },
  {
    id: 'food',
    name: t.food,
    icon: '☕',
    color: '#4ECDC4'
  },
  {
    id: 'transport',
    name: t.transport,
    icon: '🚗',
    color: '#45B7D1'
  },
  {
    id: 'entertainment',
    name: t.entertainment,
    icon: '🎮',
    color: '#96CEB4'
  },
  {
    id: 'health',
    name: t.health,
    icon: '❤️',
    color: '#FF7F50'
  },
  {
    id: 'home',
    name: t.home,
    icon: '🏠',
    color: '#9B59B6'
  }
];

// Keep the original for backward compatibility
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

export default {};