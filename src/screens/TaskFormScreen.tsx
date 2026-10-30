import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { Task } from '../types';
import { COLORS, SPACING, STRINGS, LIMITS } from '../constants';

interface TaskFormScreenProps extends NativeStackScreenProps<RootStackParamList, 'TaskForm'> {
  onSave: (task: Task) => void;
}

export default function TaskFormScreen({ route, navigation, onSave }: TaskFormScreenProps) {
  const existing = route.params?.task;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [titleError, setTitleError] = useState(false);

  function handleTitleChange(text: string) {
    setTitle(text);
    if (titleError && text.trim()) setTitleError(false);
  }

  function handleSave() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const task: Task = {
      id: existing?.id ?? Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
    };
    onSave(task);
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label}>{STRINGS.titleLabel}</Text>
        <Text style={styles.counter}>{title.length}/{LIMITS.titleMaxLength}</Text>
      </View>
      <TextInput
        style={[styles.input, titleError && styles.inputError]}
        placeholder={STRINGS.titlePlaceholder}
        placeholderTextColor={COLORS.textMuted}
        value={title}
        onChangeText={handleTitleChange}
        maxLength={LIMITS.titleMaxLength}
        autoFocus
        accessibilityLabel={STRINGS.titleLabel}
      />
      {titleError && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {STRINGS.titleRequired}
        </Text>
      )}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{STRINGS.descLabel}</Text>
        <Text style={styles.counter}>{description.length}/{LIMITS.descMaxLength}</Text>
      </View>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder={STRINGS.descPlaceholder}
        placeholderTextColor={COLORS.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={LIMITS.descMaxLength}
        accessibilityLabel={STRINGS.descLabel}
      />
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, styles.cancelBtn]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.cancelText}>{STRINGS.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.saveBtn]}
          onPress={handleSave}
          accessibilityRole="button"
        >
          <Text style={styles.saveText}>{STRINGS.save}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  counter: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 4,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
  saveText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 15,
  },
});
