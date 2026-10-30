import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { Task, SortOrder } from '../types';
import TaskItem from '../components/TaskItem';
import SortMenu from '../components/SortMenu';
import { useSortedTasks } from '../hooks/useSortedTasks';
import { COLORS, SPACING, STRINGS } from '../constants';

interface TaskListScreenProps extends NativeStackScreenProps<RootStackParamList, 'TaskList'> {
  tasks: Task[];
  onDelete: (id: string) => void;
}

export default function TaskListScreen({ navigation, tasks, onDelete }: TaskListScreenProps) {
  const insets = useSafeAreaInsets();
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const sortedTasks = useSortedTasks(tasks, sortOrder);

  // Botón "Ordenar" en el header; solo tiene sentido con más de una tarea
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        tasks.length > 1 ? (
          <TouchableOpacity
            onPress={() => setSortMenuVisible(true)}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.sortMenuTitle}
          >
            <Text style={styles.headerBtnText}>{STRINGS.sort}</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, tasks.length]);

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onEdit={(task) => navigation.navigate('TaskForm', { task })}
            onDelete={onDelete}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{STRINGS.emptyList}</Text>
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 56 + SPACING.lg + insets.bottom + SPACING.md },
        ]}
      />
      <TouchableOpacity
        style={[styles.fab, { bottom: SPACING.lg + insets.bottom }]}
        onPress={() => navigation.navigate('TaskForm', {})}
        accessibilityRole="button"
        accessibilityLabel={STRINGS.addTask}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <SortMenu
        visible={sortMenuVisible}
        selected={sortOrder}
        onSelect={setSortOrder}
        onClose={() => setSortMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: COLORS.textMuted,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  headerBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '600',
  },
  fabText: {
    color: COLORS.surface,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
});
