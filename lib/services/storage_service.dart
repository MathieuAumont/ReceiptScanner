import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:receipt_scanner_flutter/models/receipt.dart';

class StorageService {
  static const String _receiptsKey = 'receipts';

  Future<List<Receipt>> getReceipts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final receiptsJson = prefs.getString(_receiptsKey);
      
      if (receiptsJson == null) return [];
      
      final List<dynamic> receiptsList = json.decode(receiptsJson);
      return receiptsList.map((json) => Receipt.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load receipts: $e');
    }
  }

  Future<void> saveReceipt(Receipt receipt) async {
    try {
      final receipts = await getReceipts();
      receipts.add(receipt);
      await _saveReceipts(receipts);
    } catch (e) {
      throw Exception('Failed to save receipt: $e');
    }
  }

  Future<void> updateReceipt(Receipt receipt) async {
    try {
      final receipts = await getReceipts();
      final index = receipts.indexWhere((r) => r.id == receipt.id);
      
      if (index != -1) {
        receipts[index] = receipt;
        await _saveReceipts(receipts);
      } else {
        throw Exception('Receipt not found');
      }
    } catch (e) {
      throw Exception('Failed to update receipt: $e');
    }
  }

  Future<void> deleteReceipt(String id) async {
    try {
      final receipts = await getReceipts();
      receipts.removeWhere((receipt) => receipt.id == id);
      await _saveReceipts(receipts);
    } catch (e) {
      throw Exception('Failed to delete receipt: $e');
    }
  }

  Future<void> _saveReceipts(List<Receipt> receipts) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final receiptsJson = json.encode(receipts.map((r) => r.toJson()).toList());
      await prefs.setString(_receiptsKey, receiptsJson);
    } catch (e) {
      throw Exception('Failed to save receipts: $e');
    }
  }

  Future<void> clearAllData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_receiptsKey);
    } catch (e) {
      throw Exception('Failed to clear data: $e');
    }
  }
}