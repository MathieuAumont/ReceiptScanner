export function formatCurrency(amount: number, currency: string = 'CAD'): string {
  const locales: { [key: string]: string } = {
    'CAD': 'en-CA',
    'USD': 'en-US',
    'EUR': 'fr-FR',
  };

  const locale = locales[currency] || 'en-CA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string = 'fr-CA'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Export par défaut vide pour éviter l'erreur de route
export default {}; 