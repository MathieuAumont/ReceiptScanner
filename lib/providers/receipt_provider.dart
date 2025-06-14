import 'package:flutter/material.dart';
import 'package:receipt_scanner_flutter/models/receipt.dart';
import 'package:receipt_scanner_flutter/services/storage_service.dart';

class ReceiptProvider extends ChangeNotifier {
  final StorageService _storageService = StorageService();
  List<Receipt> _receipts = [];
  bool _isLoading = false;

  List<Receipt> get receipts => _receipts;
  bool get isLoading => _isLoading;

  List<Receipt> get recentReceipts {
    final sorted = List<Receipt>.from(_receipts);
    sorted.sort((a, b) => b.date.compareTo(a.date));
    return sorted.take(5).toList();
  }

  double get totalSpending {
    return _receipts.fold(0.0, (sum, receipt) => sum + receipt.totalAmount);
  }

  double getMonthlySpending([DateTime? month]) {
    final targetMonth = month ?? DateTime.now();
    return _receipts
        .where((receipt) =>
            receipt.date.year == targetMonth.year &&
            receipt.date.month == targetMonth.month)
        .fold(0.0, (sum, receipt) => sum + receipt.totalAmount);
  }

  ReceiptProvider() {
    loadReceipts();
  }

  Future<void> loadReceipts() async {
    _isLoading = true;
    notifyListeners();

    try {
      _receipts = await _storageService.getReceipts();
    } catch (e) {
      debugPrint('Error loading receipts: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addReceipt(Receipt receipt) async {
    try {
      await _storageService.saveReceipt(receipt);
      _receipts.add(receipt);
      notifyListeners();
    } catch (e) {
      debugPrint('Error adding receipt: $e');
      rethrow;
    }
  }

  Future<void> updateReceipt(Receipt receipt) async {
    try {
      await _storageService.updateReceipt(receipt);
      final index = _receipts.indexWhere((r) => r.id == receipt.id);
      if (index != -1) {
        _receipts[index] = receipt;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error updating receipt: $e');
      rethrow;
    }
  }

  Future<void> deleteReceipt(String id) async {
    try {
      await _storageService.deleteReceipt(id);
      _receipts.removeWhere((receipt) => receipt.id == id);
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting receipt: $e');
      rethrow;
    }
  }

  Receipt? getReceiptById(String id) {
    try {
      return _receipts.firstWhere((receipt) => receipt.id == id);
    } catch (e) {
      return null;
    }
  }

  List<Receipt> getReceiptsByCategory(String categoryId) {
    return _receipts.where((receipt) => receipt.category == categoryId).toList();
  }

  Map<String, double> getCategoryTotals() {
    final Map<String, double> totals = {};
    for (final receipt in _receipts) {
      totals[receipt.category] = (totals[receipt.category] ?? 0) + receipt.totalAmount;
    }
    return totals;
  }
}