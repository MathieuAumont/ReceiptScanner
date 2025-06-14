import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:receipt_scanner_flutter/providers/theme_provider.dart';
import 'package:receipt_scanner_flutter/providers/language_provider.dart';
import 'package:receipt_scanner_flutter/providers/receipt_provider.dart';
import 'package:receipt_scanner_flutter/services/storage_service.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final languageProvider = Provider.of<LanguageProvider>(context);
    final receiptProvider = Provider.of<ReceiptProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(languageProvider.translate('settings')),
      ),
      body: ListView(
        children: [
          // Preferences Section
          _buildSectionHeader(context, languageProvider.translate('preferences')),
          
          SwitchListTile(
            leading: const Icon(LucideIcons.moon),
            title: Text(languageProvider.translate('dark_mode')),
            value: themeProvider.isDarkMode,
            onChanged: (value) => themeProvider.toggleTheme(),
          ),
          
          SwitchListTile(
            leading: const Icon(LucideIcons.globe),
            title: Text(languageProvider.translate('language')),
            subtitle: Text(languageProvider.isFrench ? 'Français' : 'English'),
            value: !languageProvider.isFrench,
            onChanged: (value) => languageProvider.toggleLanguage(),
          ),
          
          const Divider(),
          
          // Data Management Section
          _buildSectionHeader(context, languageProvider.translate('data_management')),
          
          ListTile(
            leading: const Icon(LucideIcons.database),
            title: const Text('Storage Used'),
            subtitle: Text('${receiptProvider.receipts.length} receipts'),
            trailing: const Icon(LucideIcons.chevronRight),
          ),
          
          ListTile(
            leading: const Icon(LucideIcons.download),
            title: Text(languageProvider.translate('export_data')),
            subtitle: const Text('Export receipts as CSV'),
            trailing: const Icon(LucideIcons.chevronRight),
            onTap: () {
              // TODO: Implement export functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Export feature coming soon!')),
              );
            },
          ),
          
          ListTile(
            leading: const Icon(LucideIcons.trash2, color: Colors.red),
            title: Text(
              languageProvider.translate('clear_all_data'),
              style: const TextStyle(color: Colors.red),
            ),
            subtitle: const Text('Delete all receipts and data'),
            onTap: () => _showClearDataDialog(context, receiptProvider),
          ),
          
          const Divider(),
          
          // About Section
          _buildSectionHeader(context, languageProvider.translate('about')),
          
          ListTile(
            leading: const Icon(LucideIcons.helpCircle),
            title: const Text('Help & Support'),
            trailing: const Icon(LucideIcons.chevronRight),
            onTap: () {
              // TODO: Navigate to help screen
            },
          ),
          
          ListTile(
            leading: const Icon(LucideIcons.info),
            title: Text(languageProvider.translate('version')),
            subtitle: const Text('1.0.0'),
          ),
          
          const SizedBox(height: 32),
          
          // Footer
          Center(
            child: Text(
              'Receipt Scanner Flutter © ${DateTime.now().year}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ),
          
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
          color: Theme.of(context).colorScheme.primary,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showClearDataDialog(BuildContext context, ReceiptProvider receiptProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear All Data'),
        content: const Text(
          'Are you sure you want to delete all receipts and data? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              try {
                await StorageService().clearAllData();
                await receiptProvider.loadReceipts();
                
                if (context.mounted) {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('All data cleared successfully'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error clearing data: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}