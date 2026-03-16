import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { useCurrency } from '@/hooks/useCurrency';
import { TransactionType } from '@/constants/types';

interface AmountTextProps {
  amount: number;
  type?: TransactionType;
  style?: TextStyle;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 13,
  md: 15,
  lg: 20,
  xl: 32,
};

export function AmountText({ amount, type, style, showSign = false, size = 'md' }: AmountTextProps) {
  const { format } = useCurrency();

  const color =
    type === 'INCOME'
      ? Colors.income
      : type === 'EXPENSE'
      ? Colors.expense
      : Colors.text;

  const sign = showSign && type === 'INCOME' ? '+' : type === 'EXPENSE' ? '-' : '';

  return (
    <Text style={[styles.base, { color, fontSize: sizeMap[size] }, style]}>
      {sign}
      {format(Math.abs(amount))}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: '700',
  },
});
