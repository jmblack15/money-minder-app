export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  // Expenses
  { id: 'food', name: 'Alimentación', icon: '🍔', color: '#FF6B6B', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: '🚗', color: '#FFB86C', type: 'expense' },
  { id: 'housing', name: 'Vivienda', icon: '🏠', color: '#BD93F9', type: 'expense' },
  { id: 'health', name: 'Salud', icon: '💊', color: '#FF79C6', type: 'expense' },
  { id: 'education', name: 'Educación', icon: '📚', color: '#8BE9FD', type: 'expense' },
  { id: 'entertainment', name: 'Entretenimiento', icon: '🎮', color: '#50FA7B', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: '🛍️', color: '#F1FA8C', type: 'expense' },
  { id: 'utilities', name: 'Servicios', icon: '💡', color: '#FFB86C', type: 'expense' },
  { id: 'travel', name: 'Viajes', icon: '✈️', color: '#6BE5FD', type: 'expense' },
  { id: 'pets', name: 'Mascotas', icon: '🐾', color: '#FF79C6', type: 'expense' },
  { id: 'beauty', name: 'Belleza', icon: '💄', color: '#FF92DF', type: 'expense' },
  { id: 'sports', name: 'Deportes', icon: '⚽', color: '#50FA7B', type: 'expense' },
  // Income
  { id: 'salary', name: 'Salario', icon: '💼', color: '#2DD4A7', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#2DD4A7', type: 'income' },
  { id: 'investment', name: 'Inversiones', icon: '📈', color: '#2DD4A7', type: 'income' },
  { id: 'gift', name: 'Regalo', icon: '🎁', color: '#2DD4A7', type: 'income' },
  { id: 'other_income', name: 'Otros ingresos', icon: '💰', color: '#2DD4A7', type: 'income' },
  // Both
  { id: 'other', name: 'Otros', icon: '📦', color: '#8B8FA8', type: 'both' },
  { id: 'transfer', name: 'Transferencia', icon: '🔄', color: '#7C5CFC', type: 'both' },
];

export const ACCOUNT_TYPES = [
  { id: 'checking', name: 'Cuenta corriente', icon: '🏦' },
  { id: 'savings', name: 'Ahorro', icon: '💰' },
  { id: 'credit_card', name: 'Tarjeta crédito', icon: '💳' },
  { id: 'cash', name: 'Efectivo', icon: '💵' },
  { id: 'investment', name: 'Inversión', icon: '📈' },
  { id: 'other', name: 'Otro', icon: '📦' },
] as const;

export const BUDGET_PERIODS = [
  { id: 'weekly', name: 'Semanal' },
  { id: 'monthly', name: 'Mensual' },
] as const;

export const ACCOUNT_COLORS = [
  '#7C5CFC', '#2DD4A7', '#FF6B6B', '#F59E0B',
  '#3B82F6', '#EC4899', '#10B981', '#8B5CF6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316',
];
