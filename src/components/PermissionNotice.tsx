import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PermissionStatus } from '../types';
import { COLORS, SPACING, STRINGS } from '../constants';
import { isPermissionRejected, openAppSettings } from '../services/permissions';

interface PermissionNoticeProps {
  status: PermissionStatus;
  message: string;
}

export default function PermissionNotice({ status, message }: PermissionNoticeProps) {
  if (!isPermissionRejected(status)) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={openAppSettings}
        accessibilityRole="button"
        accessibilityLabel={STRINGS.openSettings}
      >
        <Text style={styles.buttonText}>{STRINGS.openSettings}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
  },
  message: {
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  button: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.sm,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
