export interface BarChartData {
  id?: string;
  label: string;
  value: number;
}

export interface PieChartData {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export default {
  // Export un objet vide par défaut pour satisfaire l'exigence d'export par défaut
}; 