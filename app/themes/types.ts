export interface Theme {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  chartColors: string[];
}

const defaultTheme: Theme = {
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  accent: '#007AFF',
  success: '#4CD964',
  warning: '#FF9500',
  error: '#FF3B30',
  chartColors: ['#007AFF', '#4CD964', '#FF9500', '#FF3B30', '#5856D6']
};

export default defaultTheme; 