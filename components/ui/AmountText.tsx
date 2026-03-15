import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

interface AmountTextProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral';
  size?: number;
  bold?: boolean;
  style?: TextStyle;
  showSign?: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  MXN: '$',
  COP: '$',
  ARS: '$',
  CLP: '$',
  PEN: 'S/',
  BRL: 'R$',
  GBP: '£',
};

export function formatAmount(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AmountText({
  amount,
  type = 'neutral',
  size = 16,
  bold = true,
  style,
  showSign = false,
}: AmountTextProps) {
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');

  const color =
    type === 'income'
      ? Colors.income
      : type === 'expense'
        ? Colors.expense
        : Colors.textPrimary;

  const sign = showSign ? (type === 'expense' ? '-' : type === 'income' ? '+' : '') : '';

  return (
    <Text
      style={[
        {
          color,
          fontSize: size,
          fontWeight: bold ? '700' : '400',
        },
        style,
      ]}
    >
      {sign}
      {formatAmount(amount, currency)}
    </Text>
  );
}
