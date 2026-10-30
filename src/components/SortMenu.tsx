import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import type { SortOrder } from '../types';
import { COLORS, SPACING, STRINGS } from '../constants';

interface SortMenuProps {
  visible: boolean;
  selected: SortOrder;
  onSelect: (order: SortOrder) => void;
  onClose: () => void;
}

const OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: STRINGS.sortNewest },
  { value: 'oldest', label: STRINGS.sortOldest },
  { value: 'alphabetical', label: STRINGS.sortAlphabetical },
];

export default function SortMenu({ visible, selected, onSelect, onClose }: SortMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menu} accessibilityRole="menu">
          <Text style={styles.title}>{STRINGS.sortMenuTitle}</Text>
          {OPTIONS.map(({ value, label }) => {
            const isSelected = value === selected;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => {
                  onSelect(value);
                  onClose();
                }}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {label}
                </Text>
                {isSelected && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    width: '80%',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: SPACING.lg,
  },
  optionSelected: {
    backgroundColor: COLORS.background,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
