import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Transaction } from '@/types';
import { AmountText } from '@/components/ui/AmountText';
import { Colors } from '@/constants/colors';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const { category, amount, type, description, date, account } = transaction;
  const icon = category?.icon ?? '💰';
  const bgColor = category?.color ? `${category.color}22` : `${Colors.primary}22`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: pressed ? Colors.surfaceElevated : Colors.surface,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
      })}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '600' }}
          numberOfLines={1}
        >
          {description || category?.name || 'Transacción'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {account && (
            <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
              {account.name}
            </Text>
          )}
          <Text style={{ color: Colors.border, fontSize: 12 }}>•</Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            {format(new Date(date), 'dd MMM', { locale: es })}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <AmountText
        amount={amount}
        type={type === 'income' ? 'income' : type === 'expense' ? 'expense' : 'neutral'}
        showSign
        size={15}
      />
    </Pressable>
  );
}
