import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  LayoutAnimation,
} from 'react-native';
import type { Task } from '../types';
import { COLORS, SPACING, STRINGS } from '../constants';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

type TextLayoutEvent = Parameters<
  NonNullable<React.ComponentProps<typeof Text>['onTextLayout']>
>[0];

export default function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [titleTruncated, setTitleTruncated] = useState(false);
  const [descTruncated, setDescTruncated] = useState(false);

  const handleTitleMeasurement = useCallback((e: TextLayoutEvent) => {
    const lines = e?.nativeEvent?.lines;
    if (lines) {
      setTitleTruncated(lines.length > 2);
    }
  }, []);

  const handleDescMeasurement = useCallback((e: TextLayoutEvent) => {
    const lines = e?.nativeEvent?.lines;
    if (lines) {
      setDescTruncated(lines.length > 3);
    }
  }, []);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const showExpandButton = titleTruncated || descTruncated;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Textos visibles con truncado condicional */}
          <Text
            style={styles.title}
            numberOfLines={expanded ? undefined : 2}
            ellipsizeMode="tail"
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text
              style={styles.description}
              numberOfLines={expanded ? undefined : 3}
              ellipsizeMode="tail"
            >
              {task.description}
            </Text>
          ) : null}

          {/* Textos gemelos invisibles para medición precisa sin numberOfLines */}
          <Text
            style={[styles.title, styles.measuringText]}
            onTextLayout={handleTitleMeasurement}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text
              style={[styles.description, styles.measuringText]}
              onTextLayout={handleDescMeasurement}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {task.description}
            </Text>
          ) : null}

          {showExpandButton && (
            <TouchableOpacity
              onPress={toggleExpand}
              style={styles.expandToggle}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              hitSlop={{ left: 8, right: 8 }}
            >
              <Text style={styles.expandToggleText}>
                {expanded ? STRINGS.seeLess : STRINGS.seeMore}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.editBtn]}
            onPress={() => onEdit(task)}
            accessibilityLabel={`${STRINGS.edit} ${task.title}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.btnText}>{STRINGS.edit}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.deleteBtn]}
            onPress={() => setConfirmVisible(true)}
            accessibilityLabel={`${STRINGS.delete} ${task.title}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.btnText}>{STRINGS.delete}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setConfirmVisible(false)}>
          <Pressable style={styles.dialog}>
            <Text style={styles.dialogTitle}>{STRINGS.deleteConfirmTitle}</Text>
            <Text style={styles.dialogMessage}>
              {STRINGS.deleteConfirmPrefix}
              <Text
                style={styles.dialogTaskTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {task.title}
              </Text>
              {STRINGS.deleteConfirmSuffix}
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelDialogBtn]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelDialogText}>{STRINGS.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.deleteBtn]}
                onPress={() => {
                  setConfirmVisible(false);
                  onDelete(task.id);
                }}
              >
                <Text style={styles.btnText}>{STRINGS.deleteConfirm}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contentContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  measuringText: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
  expandToggle: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  expandToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
  },
  btnText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '80%',
    gap: SPACING.sm,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  dialogMessage: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 21,
  },
  dialogTaskTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelDialogBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelDialogText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
