export interface Translations {
  // Navigation
  home: string;
  scan: string;
  manualEntry: string;
  budget: string;
  reports: string;
  settings: string;
  
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  back: string;
  loading: string;
  error: string;
  success: string;
  total: string;
  date: string;
  amount: string;
  category: string;
  language: string;
  
  // Home Screen
  receiptScanner: string;
  totalBudget: string;
  monthlySpending: string;
  recentReceipts: string;
  seeAll: string;
  noReceipts: string;
  noReceiptsSubtitle: string;
  
  // Scan Screen
  scanReceipt: string;
  upload: string;
  analyzing: string;
  
  // Manual Entry
  addReceipt: string;
  generalInfo: string;
  storeName: string;
  items: string;
  addItem: string;
  itemName: string;
  price: string;
  quantity: string;
  summary: string;
  subtotal: string;
  tps: string;
  tvq: string;
  reset: string;
  pricesIncludeTax: string;
  
  // Budget
  budgetManagement: string;
  totalBudgetMonth: string;
  currentMonth: string;
  planned: string;
  spent: string;
  remaining: string;
  modifyBudget: string;
  saveBudget: string;
  budgetSaved: string;
  
  // Reports
  reportsAnalytics: string;
  totalExpenses: string;
  numberOfReceipts: string;
  aiAnalysis: string;
  personalizedInsights: string;
  customReport: string;
  customPeriod: string;
  categoryBreakdown: string;
  monthlyEvolution: string;
  noDataAvailable: string;
  
  // Custom Report
  customReportTitle: string;
  periodSummary: string;
  receipts: string;
  periodFilters: string;
  startDate: string;
  endDate: string;
  categories: string;
  temporalEvolution: string;
  noExpensesFound: string;
  adjustFilters: string;
  
  // Settings
  preferences: string;
  darkMode: string;
  notifications: string;
  dataManagement: string;
  storageUsed: string;
  exportData: string;
  clearAllData: string;
  about: string;
  helpSupport: string;
  version: string;
  
  // Categories
  shopping: string;
  food: string;
  transport: string;
  entertainment: string;
  health: string;
  
  // Help & Support
  helpSupportTitle: string;
  aboutApp: string;
  keyFeatures: string;
  howToUse: string;
  tipsAndBestPractices: string;
  faq: string;
  needMoreHelp: string;
  
  // Receipt Details
  receiptDetails: string;
  store: string;
  modify: string;
  viewImage: string;
  receiptNotFound: string;
  
  // Errors and Messages
  errorSavingReceipt: string;
  errorLoadingReceipts: string;
  missingStoreName: string;
  missingItems: string;
  receiptSavedSuccessfully: string;
  confirmDelete: string;
  deleteConfirmMessage: string;
  
  // Analysis
  spendingAnalysis: string;
  askQuestion: string;
  examples: string;
  
  // Months
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
}

export const translations: { [key: string]: Translations } = {
  fr: {
    // Navigation
    home: 'Accueil',
    scan: 'Scanner',
    manualEntry: 'Ajouter',
    budget: 'Budget',
    reports: 'Rapports',
    settings: 'Paramètres',
    
    // Common
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    total: 'Total',
    date: 'Date',
    amount: 'Montant',
    category: 'Catégorie',
    language: 'Langue',
    
    // Home Screen
    receiptScanner: 'Receipt Scanner',
    totalBudget: 'Budget Total',
    monthlySpending: 'Dépenses du mois',
    recentReceipts: 'Reçus récents',
    seeAll: 'Voir tout',
    noReceipts: 'Aucun reçu',
    noReceiptsSubtitle: 'Commencez par scanner un reçu ou en ajouter un manuellement',
    
    // Scan Screen
    scanReceipt: 'Scanner un reçu',
    upload: 'Télécharger',
    analyzing: 'Analyse en cours...',
    
    // Manual Entry
    addReceipt: 'Ajouter un reçu',
    generalInfo: 'Informations générales',
    storeName: 'Nom du magasin',
    items: 'Articles',
    addItem: 'Ajouter un article',
    itemName: 'Nom de l\'article',
    price: 'Prix',
    quantity: 'Qté',
    summary: 'Résumé',
    subtotal: 'Sous-total',
    tps: 'TPS (5%)',
    tvq: 'TVQ (9.975%)',
    reset: 'Réinitialiser',
    pricesIncludeTax: 'Prix incluent les taxes',
    
    // Budget
    budgetManagement: 'Gestion du Budget',
    totalBudgetMonth: 'Budget Total du Mois',
    currentMonth: 'Actuel',
    planned: 'Planifié',
    spent: 'Dépensé',
    remaining: 'Restant',
    modifyBudget: 'Modifier Budget',
    saveBudget: 'Sauvegarder Budget',
    budgetSaved: 'Budget sauvegardé avec succès',
    
    // Reports
    reportsAnalytics: 'Rapports',
    totalExpenses: 'Total des dépenses',
    numberOfReceipts: 'Nombre de reçus',
    aiAnalysis: 'Analyse IA',
    personalizedInsights: 'Insights personnalisés',
    customReport: 'Rapport Custom',
    customPeriod: 'Période personnalisée',
    categoryBreakdown: 'Répartition par catégorie',
    monthlyEvolution: 'Évolution mensuelle',
    noDataAvailable: 'Aucune donnée disponible',
    
    // Custom Report
    customReportTitle: 'Rapport personnalisé',
    periodSummary: 'Résumé de la période',
    receipts: 'reçus',
    periodFilters: 'Filtres de période',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    categories: 'Catégories',
    temporalEvolution: 'Évolution temporelle',
    noExpensesFound: 'Aucune dépense trouvée pour cette période et ces critères',
    adjustFilters: 'Essayez d\'ajuster vos filtres ou d\'ajouter des reçus',
    
    // Settings
    preferences: 'Préférences',
    darkMode: 'Mode sombre',
    notifications: 'Notifications',
    dataManagement: 'Gestion des données',
    storageUsed: 'Stockage utilisé',
    exportData: 'Exporter les données',
    clearAllData: 'Effacer toutes les données',
    about: 'À propos',
    helpSupport: 'Aide et support',
    version: 'Version',
    
    // Categories
    shopping: 'Magasinage',
    food: 'Alimentation',
    transport: 'Transport',
    entertainment: 'Loisirs',
    health: 'Santé',
    
    // Help & Support
    helpSupportTitle: 'Aide et Support',
    aboutApp: 'À propos de Receipt Scanner',
    keyFeatures: 'Fonctionnalités principales',
    howToUse: 'Comment utiliser',
    tipsAndBestPractices: 'Conseils et bonnes pratiques',
    faq: 'Questions fréquentes',
    needMoreHelp: 'Besoin d\'aide supplémentaire ?',
    
    // Receipt Details
    receiptDetails: 'Détails du reçu',
    store: 'Magasin',
    modify: 'Modifier',
    viewImage: 'Voir l\'image',
    receiptNotFound: 'Reçu non trouvé',
    
    // Errors and Messages
    errorSavingReceipt: 'Erreur lors de la sauvegarde du reçu',
    errorLoadingReceipts: 'Erreur lors du chargement des reçus',
    missingStoreName: 'Veuillez entrer le nom du magasin',
    missingItems: 'Veuillez entrer au moins un article avec un prix',
    receiptSavedSuccessfully: 'Reçu sauvegardé avec succès!',
    confirmDelete: 'Confirmer la suppression',
    deleteConfirmMessage: 'Êtes-vous sûr de vouloir supprimer ce reçu ? Cette action ne peut pas être annulée.',
    
    // Analysis
    spendingAnalysis: 'Analyse des dépenses',
    askQuestion: 'Posez une question sur vos dépenses',
    examples: 'Exemples :',
    
    // Months
    january: 'janvier',
    february: 'février',
    march: 'mars',
    april: 'avril',
    may: 'mai',
    june: 'juin',
    july: 'juillet',
    august: 'août',
    september: 'septembre',
    october: 'octobre',
    november: 'novembre',
    december: 'décembre',
  },
  
  en: {
    // Navigation
    home: 'Home',
    scan: 'Scan',
    manualEntry: 'Add',
    budget: 'Budget',
    reports: 'Reports',
    settings: 'Settings',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    total: 'Total',
    date: 'Date',
    amount: 'Amount',
    category: 'Category',
    language: 'Language',
    
    // Home Screen
    receiptScanner: 'Receipt Scanner',
    totalBudget: 'Total Budget',
    monthlySpending: 'Monthly Spending',
    recentReceipts: 'Recent Receipts',
    seeAll: 'See All',
    noReceipts: 'No Receipts',
    noReceiptsSubtitle: 'Start by scanning a receipt or adding one manually',
    
    // Scan Screen
    scanReceipt: 'Scan Receipt',
    upload: 'Upload',
    analyzing: 'Analyzing...',
    
    // Manual Entry
    addReceipt: 'Add Receipt',
    generalInfo: 'General Information',
    storeName: 'Store Name',
    items: 'Items',
    addItem: 'Add Item',
    itemName: 'Item Name',
    price: 'Price',
    quantity: 'Qty',
    summary: 'Summary',
    subtotal: 'Subtotal',
    tps: 'GST (5%)',
    tvq: 'PST (9.975%)',
    reset: 'Reset',
    pricesIncludeTax: 'Prices include tax',
    
    // Budget
    budgetManagement: 'Budget Management',
    totalBudgetMonth: 'Total Monthly Budget',
    currentMonth: 'Current',
    planned: 'Planned',
    spent: 'Spent',
    remaining: 'Remaining',
    modifyBudget: 'Modify Budget',
    saveBudget: 'Save Budget',
    budgetSaved: 'Budget saved successfully',
    
    // Reports
    reportsAnalytics: 'Reports',
    totalExpenses: 'Total Expenses',
    numberOfReceipts: 'Number of Receipts',
    aiAnalysis: 'AI Analysis',
    personalizedInsights: 'Personalized Insights',
    customReport: 'Custom Report',
    customPeriod: 'Custom Period',
    categoryBreakdown: 'Category Breakdown',
    monthlyEvolution: 'Monthly Evolution',
    noDataAvailable: 'No data available',
    
    // Custom Report
    customReportTitle: 'Custom Report',
    periodSummary: 'Period Summary',
    receipts: 'receipts',
    periodFilters: 'Period Filters',
    startDate: 'Start Date',
    endDate: 'End Date',
    categories: 'Categories',
    temporalEvolution: 'Temporal Evolution',
    noExpensesFound: 'No expenses found for this period and criteria',
    adjustFilters: 'Try adjusting your filters or adding receipts',
    
    // Settings
    preferences: 'Preferences',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    dataManagement: 'Data Management',
    storageUsed: 'Storage Used',
    exportData: 'Export Data',
    clearAllData: 'Clear All Data',
    about: 'About',
    helpSupport: 'Help & Support',
    version: 'Version',
    
    // Categories
    shopping: 'Shopping',
    food: 'Food',
    transport: 'Transport',
    entertainment: 'Entertainment',
    health: 'Health',
    
    // Help & Support
    helpSupportTitle: 'Help & Support',
    aboutApp: 'About Receipt Scanner',
    keyFeatures: 'Key Features',
    howToUse: 'How to Use',
    tipsAndBestPractices: 'Tips & Best Practices',
    faq: 'Frequently Asked Questions',
    needMoreHelp: 'Need More Help?',
    
    // Receipt Details
    receiptDetails: 'Receipt Details',
    store: 'Store',
    modify: 'Modify',
    viewImage: 'View Image',
    receiptNotFound: 'Receipt not found',
    
    // Errors and Messages
    errorSavingReceipt: 'Error saving receipt',
    errorLoadingReceipts: 'Error loading receipts',
    missingStoreName: 'Please enter the store name',
    missingItems: 'Please enter at least one item with a price',
    receiptSavedSuccessfully: 'Receipt saved successfully!',
    confirmDelete: 'Confirm Delete',
    deleteConfirmMessage: 'Are you sure you want to delete this receipt? This action cannot be undone.',
    
    // Analysis
    spendingAnalysis: 'Spending Analysis',
    askQuestion: 'Ask a question about your spending',
    examples: 'Examples:',
    
    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  }
};

export default translations;