import React from 'react';
import { Text, View } from 'react-native';
import { BudgetWithProgress } from '@/hooks/useBudgets';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { AmountText, formatAmount } from '@/components/ui/AmountText';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

interface BudgetCardProps {
  budget: BudgetWithProgress;
  onPress?: () => void;
}

const STATUS_BADGE: Record<string, { label: string; bg: string }> = {
  safe: { label: 'Al día', bg: Colors.income },
  warning: { label: 'Alerta', bg: Colors.warning },
  danger: { label: '¡Superado!', bg: Colors.expense },
};

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
  const { category, amount, spent = 0, percentage, status, period } = budget;
  const badge = STATUS_BADGE[status];

  return (
    <Card onPress={onPress} style={{ gap: 12 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${category?.color ?? Colors.primary}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>{category?.icon ?? '📦'}</Text>
          </View>
          <View>
            <Text style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '600' }}>
              {category?.name ?? 'Categoría'}
            </Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
              {period === 'monthly' ? 'Mensual' : 'Semanal'}
            </Text>
          </View>
        </View>
        <Badge label={badge.label} backgroundColor={badge.bg} size="sm" />
      </View>

      {/* Progress */}
      <ProgressBar percentage={percentage} height={10} />

      {/* Amounts */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
          Gastado:{' '}
          <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>
            {formatAmount(spent, currency)}
          </Text>
        </Text>
        <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
          Límite:{' '}
          <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>
            {formatAmount(amount, currency)}
          </Text>
        </Text>
      </View>
    </Card>
  );
}
