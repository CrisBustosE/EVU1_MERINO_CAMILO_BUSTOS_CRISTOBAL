import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PermissionStatus } from '../types';
import { COLORS, SPACING, STRINGS } from '../constants';
import PermissionNotice from './PermissionNotice';
import PhotoThumbnail from './PhotoThumbnail';

interface PhotoPickerProps {
  photoUri?: string;
  permissionStatus: PermissionStatus;
  busy: boolean;
  hasError: boolean;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onRemovePhoto: () => void;
}

export default function PhotoPicker({
  photoUri,
  permissionStatus,
  busy,
  hasError,
  onTakePhoto,
  onPickFromGallery,
  onRemovePhoto,
}: PhotoPickerProps) {
  return (
    <View>
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={onTakePhoto}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={STRINGS.takePhoto}
          accessibilityState={{ disabled: busy, busy }}
        >
          <Text style={styles.btnText}>{STRINGS.takePhoto}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={onPickFromGallery}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={STRINGS.pickFromGallery}
          accessibilityState={{ disabled: busy, busy }}
        >
          <Text style={styles.btnText}>{STRINGS.pickFromGallery}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>{STRINGS.photoPermissionHint}</Text>
      {hasError && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {STRINGS.photoError}
        </Text>
      )}
      {photoUri && (
        <View style={styles.photoRow}>
          <PhotoThumbnail uri={photoUri} accessibilityLabel={STRINGS.photoThumbnailLabel} />
          <TouchableOpacity
            style={[styles.btn, busy && styles.btnDisabled]}
            onPress={onRemovePhoto}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.removePhoto}
          >
            <Text style={styles.btnText}>{STRINGS.removePhoto}</Text>
          </TouchableOpacity>
        </View>
      )}
      <PermissionNotice status={permissionStatus} message={STRINGS.cameraPermissionDenied} />
    </View>
  );
}

const styles = StyleSheet.create({
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  btn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.surface,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    marginTop: SPACING.sm,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
});
