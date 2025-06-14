import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class BudgetItem {
  final String categoryId;
  final double amount;

  BudgetItem({
    required this.categoryId,
    required this.amount,
  });

  Map<String, dynamic> toJson() {
    return {
      'categoryId': categoryId,
      'amount': amount,
    };
  }

  factory BudgetItem.fromJson(Map<String, dynamic> json) {
    return BudgetItem(
      categoryId: json['categoryId'],
      amount: json['amount'].toDouble(),
    );
  }
}

class BudgetProvider extends ChangeNotifier {
  Map<String, List<BudgetItem>> _budgets = {};
  
  Map<String, List<BudgetItem>> get budgets => _budgets;

  BudgetProvider() {
    loadBudgets();
  }

  List<BudgetItem> getBudgetForMonth(String monthKey) {
    return _budgets[monthKey] ?? [];
  }

  double getTotalBudgetForMonth(String monthKey) {
    final budget = getBudgetForMonth(monthKey);
    return budget.fold(0.0, (sum, item) => sum + item.amount);
  }

  Future<void> setBudgetForMonth(String monthKey, List<BudgetItem> budget) async {
    _budgets[monthKey] = budget;
    await saveBudgets();
    notifyListeners();
  }

  Future<void> loadBudgets() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final budgetsJson = prefs.getString('budgets');
      if (budgetsJson != null) {
        final Map<String, dynamic> decoded = json.decode(budgetsJson);
        _budgets = decoded.map((key, value) {
          final List<dynamic> items = value;
          return MapEntry(
            key,
            items.map((item) => BudgetItem.fromJson(item)).toList(),
          );
        });
      }
    } catch (e) {
      debugPrint('Error loading budgets: $e');
    }
    notifyListeners();
  }

  Future<void> saveBudgets() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final budgetsJson = json.encode(_budgets.map((key, value) {
        return MapEntry(key, value.map((item) => item.toJson()).toList());
      }));
      await prefs.setString('budgets', budgetsJson);
    } catch (e) {
      debugPrint('Error saving budgets: $e');
    }
  }

  String getCurrentMonthKey() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}';
  }
}