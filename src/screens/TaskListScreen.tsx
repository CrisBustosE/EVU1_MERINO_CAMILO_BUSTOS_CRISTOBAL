import React from 'react';
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
import type { Task } from '../types';
import TaskItem from '../components/TaskItem';
import { COLORS, SPACING, STRINGS } from '../constants';

interface TaskListScreenProps extends NativeStackScreenProps<RootStackParamList, 'TaskList'> {
  tasks: Task[];
  onDelete: (id: string) => void;
}

export default function TaskListScreen({ navigation, tasks, onDelete }: TaskListScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
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
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={[styles.fab, { bottom: SPACING.lg + insets.bottom }]}
        onPress={() => navigation.navigate('TaskForm', {})}
        accessibilityLabel={STRINGS.addTask}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingBottom: 80,
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
    bottom: SPACING.lg,
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
  fabText: {
    color: COLORS.surface,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
});
