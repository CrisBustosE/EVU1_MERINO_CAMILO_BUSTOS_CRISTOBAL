import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PermissionStatus, TaskLocation } from '../types';
import { COLORS, SPACING, STRINGS } from '../constants';
import { openInMaps } from '../services/maps';
import PermissionNotice from './PermissionNotice';

interface LocationFieldProps {
  location?: TaskLocation;
  address?: string;
  permissionStatus?: PermissionStatus;
  busy?: boolean;
  error?: 'locationTimeout' | 'locationError';
  /** Solo muestra la ubicación y abrirla en mapas (lista y edición). */
  readOnly?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
}

export default function LocationField({
  location,
  address,
  permissionStatus = 'undetermined',
  busy = false,
  error,
  readOnly = false,
  onAdd,
  onRemove,
}: LocationFieldProps) {
  if (readOnly && !location) return null;

  const place = location
    ? address ?? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
    : undefined;
  const accuracy =
    location?.accuracy !== undefined
      ? `${STRINGS.locationAccuracyPrefix}${Math.round(location.accuracy)}${STRINGS.locationAccuracySuffix}`
      : undefined;

  return (
    <View style={styles.container}>
      {!readOnly && !location && (
        <>
          <TouchableOpacity
            style={[styles.btn, busy && styles.btnDisabled]}
            onPress={onAdd}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.addLocation}
            accessibilityState={{ disabled: busy, busy }}
          >
            <Text style={styles.btnText}>{STRINGS.addLocation}</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>{STRINGS.locationPermissionHint}</Text>
        </>
      )}
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {STRINGS[error]}
        </Text>
      )}
      {location && (
        <View style={styles.locationBox}>
          <Text style={styles.place} accessibilityLabel={`${STRINGS.locationLabel}: ${place}`}>
            {place}
            {accuracy && <Text style={styles.accuracy}>{`  ${accuracy}`}</Text>}
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => openInMaps(location)}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.openInMaps}
            >
              <Text style={styles.btnText}>{STRINGS.openInMaps}</Text>
            </TouchableOpacity>
            {!readOnly && (
              <TouchableOpacity
                style={styles.btn}
                onPress={onRemove}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.removeLocation}
              >
                <Text style={styles.btnText}>{STRINGS.removeLocation}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {!readOnly && (
        <PermissionNotice status={permissionStatus} message={STRINGS.locationPermissionDenied} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
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
  locationBox: {
    marginTop: SPACING.sm,
  },
  place: {
    fontSize: 14,
    color: COLORS.text,
  },
  accuracy: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
