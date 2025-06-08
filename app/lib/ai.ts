// This is a simple mock of AI-generated insights for demo purposes
// In a real app, this would connect to an AI service or API

export async function generateAIInsight(): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Array of pre-written insights for demo
  const insights = [
    "Based on your spending patterns, you spent 15% more on groceries this month compared to last month. Consider checking for sales or bulk buying staples.",
    
    "You've been spending consistently on dining out. If you cooked at home one more day per week, you could save approximately $120 per month.",
    
    "Your transportation costs have decreased by 20% in the last three months. Great job optimizing your commute expenses!",
    
    "I notice you tend to make more impulse purchases on weekends. Setting a weekend budget limit might help manage these expenses.",
    
    "Your largest expense category is housing, followed by groceries and transportation. This follows typical household spending patterns.",
    
    "You've maintained consistent spending in most categories, which is good for budgeting. Your financial discipline is showing positive results.",
    
    "Based on your recent receipts, you might want to consider buying certain items in bulk to save money in the long run.",
    
    "Your spending on entertainment has increased gradually over the past few months. Consider setting a monthly entertainment budget to keep this in check.",
    
    "I notice some of your grocery trips result in smaller, more frequent purchases. Consolidating these into fewer, larger shopping trips might save both time and money.",
    
    "Comparing your spending to average households of similar size, your utility expenses are about 10% lower than average. Good job being energy efficient!",
  ];
  
  // Return random insight
  return insights[Math.floor(Math.random() * insights.length)];
}

export default {
  // Export un objet vide par défaut pour satisfaire l'exigence d'export par défaut
}; 