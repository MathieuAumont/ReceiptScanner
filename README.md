# Receipt Scanner Flutter

A beautiful and feature-rich Flutter application for scanning, managing, and analyzing receipts and expenses.

## Features

### 📱 Core Functionality
- **Receipt Scanning**: Use your camera to scan receipts with OCR processing
- **Manual Entry**: Add receipts manually with detailed item breakdown
- **Receipt Management**: View, edit, and delete receipts with ease
- **Category Organization**: Organize expenses by customizable categories

### 💰 Budget Management
- **Monthly Budgets**: Set and track budgets for different categories
- **Progress Tracking**: Visual progress indicators for budget usage
- **Spending Alerts**: Color-coded warnings when approaching budget limits

### 📊 Reports & Analytics
- **Visual Charts**: Beautiful pie charts and bar graphs for spending analysis
- **Category Breakdown**: See where your money goes with detailed breakdowns
- **Monthly Trends**: Track spending patterns over time
- **AI Insights**: Get personalized spending insights and recommendations

### 🎨 User Experience
- **Beautiful Design**: Modern Material Design 3 interface
- **Dark/Light Theme**: Automatic theme switching with manual override
- **Multi-language**: Support for French and English
- **Responsive**: Works perfectly on phones and tablets

## Screenshots

[Add screenshots here when available]

## Getting Started

### Prerequisites
- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Android Studio / VS Code
- Android device or emulator for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/receipt-scanner-flutter.git
   cd receipt-scanner-flutter
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

### Building for Release

#### Android APK
```bash
flutter build apk --release
```

#### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
```

#### iOS (requires macOS and Xcode)
```bash
flutter build ios --release
```

## Architecture

This app follows Flutter best practices with a clean architecture:

### State Management
- **Provider**: Used for state management across the app
- **ChangeNotifier**: For reactive UI updates

### Data Layer
- **SharedPreferences**: Local storage for settings and simple data
- **JSON Serialization**: For complex data structures like receipts

### UI Layer
- **Material Design 3**: Modern, beautiful UI components
- **Responsive Design**: Adapts to different screen sizes
- **Custom Widgets**: Reusable components for consistency

### Key Providers
- `ThemeProvider`: Manages dark/light theme switching
- `LanguageProvider`: Handles internationalization
- `ReceiptProvider`: Manages receipt data and operations
- `BudgetProvider`: Handles budget management

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── receipt.dart
│   └── category.dart
├── providers/                # State management
│   ├── theme_provider.dart
│   ├── language_provider.dart
│   ├── receipt_provider.dart
│   └── budget_provider.dart
├── screens/                  # App screens
│   ├── main_screen.dart
│   ├── scan_screen.dart
│   ├── manual_entry_screen.dart
│   ├── receipt_details_screen.dart
│   ├── budget_screen.dart
│   ├── reports_screen.dart
│   ├── settings_screen.dart
│   └── analysis_screen.dart
├── widgets/                  # Reusable widgets
│   └── receipt_card.dart
├── services/                 # Business logic
│   └── storage_service.dart
└── utils/                    # Utilities
    ├── currency_formatter.dart
    └── date_formatter.dart
```

## Features in Detail

### Receipt Scanning
- Camera integration with `camera` package
- Image picker for gallery selection
- OCR processing (ready for integration with services like Google Vision API)
- Automatic data extraction from receipt images

### Manual Entry
- Intuitive form for adding receipt details
- Dynamic item list with add/remove functionality
- Automatic tax calculation (TPS/TVQ for Quebec)
- Category selection with visual indicators

### Budget Management
- Monthly budget setting per category
- Visual progress tracking with color-coded indicators
- Budget vs. actual spending comparison
- Historical budget data

### Reports & Analytics
- Interactive pie charts showing category breakdown
- Monthly spending trends with bar charts
- Percentage-based analysis
- Export capabilities (planned)

### Settings & Customization
- Dark/Light theme toggle
- Language switching (French/English)
- Data management (export/clear)
- App information and help

## Customization

### Adding New Categories
Categories are defined in `lib/models/category.dart`. To add new categories:

1. Add the category to `CategoryService.getDefaultCategories()`
2. Include appropriate icon and color
3. Update translations if needed

### Theming
Themes are managed in `lib/providers/theme_provider.dart`. Customize:
- Color schemes
- Typography
- Component styles

### Internationalization
Add new languages by:
1. Extending `LanguageProvider` translations maps
2. Adding new locale support
3. Updating UI text references

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Flutter team for the amazing framework
- Material Design team for the design system
- Community packages that made this app possible

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/receipt-scanner-flutter/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

Made with ❤️ using Flutter