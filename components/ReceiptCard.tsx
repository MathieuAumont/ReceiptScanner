import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import { formatCurrency } from '@/app/lib/formatting';
import { categories } from '@/app/lib/categories';
import { Receipt } from '@/app/lib/types';

interface ReceiptCardProps {
  receipt: Receipt;
}

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push({
      pathname: '/receipt-details',
      params: { id: receipt.id }
    });
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  };
  
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#8E8E93';
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-CA', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.leftContent}>
        <View 
          style={[
            styles.categoryIcon, 
            { backgroundColor: getCategoryColor(receipt.category) }
          ]}
        >
          <ShoppingBag size={20} color="white" />
        </View>
      </View>
      
      <View style={styles.middleContent}>
        <Text style={styles.storeName} numberOfLines={1}>
          {receipt.company}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={styles.date}>{formatDate(receipt.date)}</Text>
          <Text style={styles.categoryLabel}>
            {getCategoryName(receipt.category)}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.amount}>
          {formatCurrency(receipt.totalAmount, receipt.currency)}
        </Text>
        <ChevronRight size={16} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContent: {
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleContent: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 4,
  },
});