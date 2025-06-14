import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider extends ChangeNotifier {
  static const String _languageKey = 'language';
  
  Locale _locale = const Locale('fr');
  
  Locale get locale => _locale;
  String get languageCode => _locale.languageCode;
  bool get isFrench => _locale.languageCode == 'fr';

  LanguageProvider() {
    _loadLanguage();
  }

  void setLanguage(String languageCode) {
    _locale = Locale(languageCode);
    _saveLanguage();
    notifyListeners();
  }

  void toggleLanguage() {
    _locale = _locale.languageCode == 'fr' 
        ? const Locale('en') 
        : const Locale('fr');
    _saveLanguage();
    notifyListeners();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString(_languageKey) ?? 'fr';
    _locale = Locale(languageCode);
    notifyListeners();
  }

  Future<void> _saveLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, _locale.languageCode);
  }

  // Translations
  Map<String, String> get translations => _locale.languageCode == 'fr' 
      ? _frenchTranslations 
      : _englishTranslations;

  String translate(String key) {
    return translations[key] ?? key;
  }

  static const Map<String, String> _frenchTranslations = {
    'home': 'Accueil',
    'scan': 'Scanner',
    'manual_entry': 'Ajouter',
    'budget': 'Budget',
    'reports': 'Rapports',
    'settings': 'Paramètres',
    'receipt_scanner': 'Receipt Scanner',
    'recent_receipts': 'Reçus récents',
    'total_budget': 'Budget Total',
    'monthly_spending': 'Dépenses du mois',
    'no_receipts': 'Aucun reçu',
    'no_receipts_subtitle': 'Commencez par scanner un reçu ou en ajouter un manuellement',
    'scan_receipt': 'Scanner un reçu',
    'upload': 'Télécharger',
    'analyzing': 'Analyse en cours...',
    'add_receipt': 'Ajouter un reçu',
    'store_name': 'Nom du magasin',
    'date': 'Date',
    'category': 'Catégorie',
    'items': 'Articles',
    'add_item': 'Ajouter un article',
    'item_name': 'Nom de l\'article',
    'price': 'Prix',
    'quantity': 'Quantité',
    'subtotal': 'Sous-total',
    'tps': 'TPS (5%)',
    'tvq': 'TVQ (9.975%)',
    'total': 'Total',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'back': 'Retour',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    'dark_mode': 'Mode sombre',
    'language': 'Langue',
    'preferences': 'Préférences',
    'data_management': 'Gestion des données',
    'export_data': 'Exporter les données',
    'clear_all_data': 'Effacer toutes les données',
    'about': 'À propos',
    'version': 'Version',
  };

  static const Map<String, String> _englishTranslations = {
    'home': 'Home',
    'scan': 'Scan',
    'manual_entry': 'Add',
    'budget': 'Budget',
    'reports': 'Reports',
    'settings': 'Settings',
    'receipt_scanner': 'Receipt Scanner',
    'recent_receipts': 'Recent Receipts',
    'total_budget': 'Total Budget',
    'monthly_spending': 'Monthly Spending',
    'no_receipts': 'No Receipts',
    'no_receipts_subtitle': 'Start by scanning a receipt or adding one manually',
    'scan_receipt': 'Scan Receipt',
    'upload': 'Upload',
    'analyzing': 'Analyzing...',
    'add_receipt': 'Add Receipt',
    'store_name': 'Store Name',
    'date': 'Date',
    'category': 'Category',
    'items': 'Items',
    'add_item': 'Add Item',
    'item_name': 'Item Name',
    'price': 'Price',
    'quantity': 'Quantity',
    'subtotal': 'Subtotal',
    'tps': 'GST (5%)',
    'tvq': 'PST (9.975%)',
    'total': 'Total',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'back': 'Back',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'dark_mode': 'Dark Mode',
    'language': 'Language',
    'preferences': 'Preferences',
    'data_management': 'Data Management',
    'export_data': 'Export Data',
    'clear_all_data': 'Clear All Data',
    'about': 'About',
    'version': 'Version',
  };
}