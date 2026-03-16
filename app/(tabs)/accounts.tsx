import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useAccounts, useCreateAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SkeletonBox } from '@/components/ui/SkeletonLoader';
import { Account, AccountType } from '@/constants/types';
import type { ViewStyle } from 'react-native';

const ACCOUNT_TYPES: { key: AccountType; label: string; icon: string }[] = [
  { key: 'BANK', label: 'Banco', icon: '🏦' },
  { key: 'SAVINGS', label: 'Ahorro', icon: '🐷' },
  { key: 'CREDIT_CARD', label: 'Crédito', icon: '💳' },
  { key: 'CASH', label: 'Efectivo', icon: '💵' },
];

const ACCOUNT_COLORS = [
  '#7C5CFC', '#2DD4A7', '#FF6B6B', '#FFB547',
  '#4FC3F7', '#F472B6', '#A78BFA', '#34D399',
];

// ─── Account Card ─────────────────────────────────────────────────────────────

function AccountItem({ account, onDelete }: { account: Account; onDelete: (id: string) => void }) {
  const { format: fmt } = useCurrency();
  const typeInfo = ACCOUNT_TYPES.find((t) => t.key === account.type) ?? ACCOUNT_TYPES[0];

  return (
    <Card padding={18} style={StyleSheet.flatten([styles.accountCard, { borderLeftWidth: 4, borderLeftColor: account.color }])}>
      <View style={styles.accountRow}>
        <View style={[styles.iconBox, { backgroundColor: `${account.color}20` }]}>
          <Text style={styles.accountIcon}>{typeInfo.icon}</Text>
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Badge label={typeInfo.label} color={account.color} size="sm" />
        </View>
        <View style={styles.accountRight}>
          <Text style={[styles.accountBalance, { color: account.balance >= 0 ? Colors.income : Colors.expense }]}>
            {fmt(account.balance)}
          </Text>
          <TouchableOpacity onPress={() => onDelete(account.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

// ─── Create Account Sheet ─────────────────────────────────────────────────────

function CreateAccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { mutateAsync: createAccount, isPending } = useCreateAccount();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('BANK');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Error', 'Ingresa un nombre para la cuenta');
    const initialBalance = parseFloat(balance.replace(',', '.'));
    if (isNaN(initialBalance)) return Alert.alert('Error', 'Saldo inicial inválido');

    try {
      await createAccount({ name: name.trim(), type, balance: initialBalance, color });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      setName('');
      setBalance('0');
      setColor(ACCOUNT_COLORS[0]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al crear cuenta';
      Alert.alert('Error', msg);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nueva cuenta">
      <Input
        label="Nombre de la cuenta"
        placeholder="Ej: Cuenta principal, Ahorro vacaciones..."
        value={name}
        onChangeText={setName}
        autoCapitalize="sentences"
      />

      <Text style={sheetStyles.label}>Tipo de cuenta</Text>
      <View style={sheetStyles.typeGrid}>
        {ACCOUNT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[sheetStyles.typeItem, type === t.key && { backgroundColor: `${color}20`, borderColor: color }]}
            onPress={() => setType(t.key)}
          >
            <Text style={sheetStyles.typeIcon}>{t.icon}</Text>
            <Text style={[sheetStyles.typeLabel, type === t.key && { color }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Saldo inicial"
        placeholder="0.00"
        value={balance}
        onChangeText={setBalance}
        keyboardType="decimal-pad"
      />

      <Text style={sheetStyles.label}>Color</Text>
      <View style={sheetStyles.colorRow}>
        {ACCOUNT_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[sheetStyles.colorDot, { backgroundColor: c }, color === c && sheetStyles.colorDotActive]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <Button label="Crear cuenta" onPress={handleCreate} loading={isPending} fullWidth size="lg" style={sheetStyles.btn} />
    </BottomSheet>
  );
}

// ─── Accounts Screen ──────────────────────────────────────────────────────────

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const [createVisible, setCreateVisible] = useState(false);
  const { data: accounts, isLoading, refetch } = useAccounts();
  const { mutate: deleteAccount } = useDeleteAccount();
  const { format: fmt } = useCurrency();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const totalBalance = accounts?.reduce((s, a) => s + a.balance, 0) ?? 0;

  function handleDelete(id: string) {
    Alert.alert(
      'Eliminar cuenta',
      '¿Eliminar esta cuenta? Se eliminarán también todas sus transacciones.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteAccount(id);
          },
        },
      ],
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cuentas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCreateVisible(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View style={styles.totalPadding}>
        <Card padding={20} style={styles.totalCard}>
          <Text style={styles.totalLabel}>Balance total</Text>
          <Text style={[styles.totalAmount, { color: totalBalance >= 0 ? Colors.income : Colors.expense }]}>
            {fmt(totalBalance)}
          </Text>
          <Text style={styles.totalSub}>{accounts?.length ?? 0} cuenta{accounts?.length !== 1 ? 's' : ''}</Text>
        </Card>
      </View>

      {isLoading ? (
        <View style={styles.listPadding}>
          {[1, 2, 3].map((i) => <SkeletonBox key={i} height={90} borderRadius={20} style={{ marginBottom: 12 }} />)}
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => <AccountItem account={item} onDelete={handleDelete} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🏦"
              title="Sin cuentas"
              description="Agrega una cuenta para empezar a registrar tus finanzas"
              actionLabel="Agregar cuenta"
              onAction={() => setCreateVisible(true)}
            />
          }
        />
      )}

      <CreateAccountSheet visible={createVisible} onClose={() => setCreateVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: `${Colors.primary}20`,
  },
  addBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  totalPadding: { paddingHorizontal: 20, marginBottom: 16 },
  totalCard: { borderColor: `${Colors.primary}30` },
  totalLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  totalSub: { fontSize: 13, color: Colors.textMuted },
  listPadding: { paddingHorizontal: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  accountCard: { borderRadius: 20, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  accountIcon: { fontSize: 22 },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  accountRight: { alignItems: 'flex-end', gap: 6 },
  accountBalance: { fontSize: 18, fontWeight: '800' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 14 },
});

const sheetStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, marginTop: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeItem: {
    width: '30%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  typeIcon: { fontSize: 22 },
  typeLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.text, transform: [{ scale: 1.15 }] },
  btn: { marginTop: 8 },
});
