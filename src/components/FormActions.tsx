import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, STRINGS } from '../constants';

interface FormActionsProps {
  onCancel: () => void;
  onSave: () => void;
}

export default function FormActions({ onCancel, onSave }: FormActionsProps) {
  return (
    <View style={styles.btnRow}>
      <TouchableOpacity
        style={[styles.btn, styles.cancelBtn]}
        onPress={onCancel}
        accessibilityRole="button"
      >
        <Text style={styles.cancelText}>{STRINGS.cancel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.saveBtn]}
        onPress={onSave}
        accessibilityRole="button"
      >
        <Text style={styles.saveText}>{STRINGS.save}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btnRow: {
    flexDirection: 'row',
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
