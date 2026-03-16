import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Colors } from '@/constants/colors';
import {
  useSavingsGoals,
  useCreateSavingsGoal,
  useContributeToGoal,
  useDeleteSavingsGoal,
  useGoalProgress,
} from '@/hooks/useSavingsGoals';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { SkeletonBox } from '@/components/ui/SkeletonLoader';
import { SavingsGoal } from '@/constants/types';

const GOAL_COLORS = ['#7C5CFC', '#2DD4A7', '#FF6B6B', '#FFB547', '#4FC3F7', '#F472B6'];

// ─── Circular Progress ────────────────────────────────────────────────────────

function CircularProgress({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Render as simple arc using View
  return (
    <View style={[circleStyles.container, { width: size, height: size }]}>
      <View
        style={[
          circleStyles.track,
          { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: Colors.border },
        ]}
      />
      <View
        style={[
          circleStyles.fill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            // Approximate arc using rotation
            transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }],
          },
        ]}
      />
      <Text style={[circleStyles.percent, { color }]}>{percentage.toFixed(0)}%</Text>
    </View>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  onContribute,
  onDelete,
}: {
  goal: SavingsGoal;
  onContribute: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { format: fmt } = useCurrency();
  const { percentage, daysLeft, remaining, isCompleted, isOverdue } = useGoalProgress(goal);

  return (
    <Card padding={20} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalInfo}>
          <View style={[styles.goalDot, { backgroundColor: goal.color }]} />
          <Text style={styles.goalName}>{goal.name}</Text>
          {isCompleted && <Text style={styles.completedBadge}>✅ Completado</Text>}
          {isOverdue && !isCompleted && <Text style={styles.overdueBadge}>⏰ Vencido</Text>}
        </View>
        <TouchableOpacity onPress={() => onDelete(goal.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalBody}>
        <View style={styles.goalAmounts}>
          <Text style={styles.currentAmount}>{fmt(goal.currentAmount)}</Text>
          <Text style={styles.targetAmount}>de {fmt(goal.targetAmount)}</Text>
          <Text style={styles.remaining}>{fmt(remaining)} restante</Text>
        </View>
        <View style={styles.progressCircleWrapper}>
          <View style={styles.progressCircle}>
            <Text style={[styles.progressPct, { color: goal.color }]}>{percentage.toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      <ProgressBar progress={percentage} color={goal.color ?? Colors.primary} height={8} style={styles.progressBar} />

      <View style={styles.goalFooter}>
        <Text style={styles.deadlineText}>
          {goal.deadline ? `📅 ${format(parseISO(goal.deadline), "d MMM yyyy", { locale: es })}` : ''}
          {!isCompleted && daysLeft !== null && daysLeft > 0 && ` · ${daysLeft} días`}
        </Text>
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.contributeBtn, { backgroundColor: `${goal.color}20` }]}
            onPress={() => onContribute(goal.id)}
          >
            <Text style={[styles.contributeBtnText, { color: goal.color }]}>+ Abonar</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

// ─── Contribute Sheet ─────────────────────────────────────────────────────────

function ContributeSheet({
  goalId,
  visible,
  onClose,
}: {
  goalId: string | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: contribute, isPending } = useContributeToGoal();
  const [amount, setAmount] = useState('');

  async function handleContribute() {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) return Alert.alert('Error', 'Ingresa un monto válido');
    if (!goalId) return;

    try {
      await contribute({ id: goalId, amount: parsed });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      setAmount('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al abonar';
      Alert.alert('Error', msg);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Abonar a la meta">
      <Input
        label="Monto a abonar"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        autoFocus
      />
      <Button label="Abonar" onPress={handleContribute} loading={isPending} fullWidth size="lg" />
    </BottomSheet>
  );
}

// ─── Create Goal Sheet ────────────────────────────────────────────────────────

function CreateGoalSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { mutateAsync: createGoal, isPending } = useCreateSavingsGoal();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Error', 'Ingresa un nombre');
    const amount = parseFloat(targetAmount.replace(',', '.'));
    if (!amount || amount <= 0) return Alert.alert('Error', 'Ingresa un monto válido');
    if (!deadline.match(/^\d{4}-\d{2}-\d{2}$/)) return Alert.alert('Error', 'Fecha debe ser YYYY-MM-DD');

    try {
      await createGoal({ name: name.trim(), targetAmount: amount, deadline });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      setName('');
      setTargetAmount('');
      setDeadline('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al crear meta';
      Alert.alert('Error', msg);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nueva meta de ahorro">
      <Input label="Nombre de la meta" placeholder="Ej: Vacaciones, auto, etc." value={name} onChangeText={setName} />
      <Input label="Monto objetivo" placeholder="0.00" value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" />
      <Input label="Fecha límite (YYYY-MM-DD)" placeholder="2025-12-31" value={deadline} onChangeText={setDeadline} />

      <Text style={createStyles.label}>Color</Text>
      <View style={createStyles.colorRow}>
        {GOAL_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[createStyles.colorDot, { backgroundColor: c }, color === c && createStyles.colorDotActive]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <Button label="Crear meta" onPress={handleCreate} loading={isPending} fullWidth size="lg" style={createStyles.btn} />
    </BottomSheet>
  );
}

// ─── Goals Screen ─────────────────────────────────────────────────────────────

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const [createVisible, setCreateVisible] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const { data: goals, isLoading, refetch } = useSavingsGoals();
  const { mutate: deleteGoal } = useDeleteSavingsGoal();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  function handleDelete(id: string) {
    Alert.alert('Eliminar meta', '¿Eliminar esta meta de ahorro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteGoal(id);
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Metas de ahorro</Text>
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

      {isLoading ? (
        <View style={styles.listPadding}>
          {[1, 2].map((i) => <SkeletonBox key={i} height={200} borderRadius={20} style={{ marginBottom: 12 }} />)}
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => (
            <GoalCard
              goal={item}
              onContribute={(id) => setContributeGoalId(id)}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🎯"
              title="Sin metas de ahorro"
              description="Crea tu primera meta y empieza a ahorrar con propósito"
              actionLabel="Crear meta"
              onAction={() => setCreateVisible(true)}
            />
          }
        />
      )}

      <CreateGoalSheet visible={createVisible} onClose={() => setCreateVisible(false)} />
      <ContributeSheet
        goalId={contributeGoalId}
        visible={!!contributeGoalId}
        onClose={() => setContributeGoalId(null)}
      />
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
  listPadding: { paddingHorizontal: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  goalCard: {},
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  goalInfo: { flex: 1 },
  goalDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  goalName: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  completedBadge: { fontSize: 12, color: Colors.income },
  overdueBadge: { fontSize: 12, color: Colors.expense },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
  goalBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalAmounts: { flex: 1 },
  currentAmount: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  targetAmount: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  remaining: { fontSize: 12, color: Colors.textMuted },
  progressCircleWrapper: {},
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBar: { marginBottom: 12 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadlineText: { fontSize: 12, color: Colors.textSecondary },
  contributeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100 },
  contributeBtnText: { fontSize: 13, fontWeight: '600' },
});

const createStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.text, transform: [{ scale: 1.15 }] },
  btn: { marginTop: 8 },
});

const circleStyles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  track: { position: 'absolute' },
  fill: { position: 'absolute', borderLeftColor: 'transparent', borderBottomColor: 'transparent' },
  percent: { fontSize: 13, fontWeight: '700' },
});
