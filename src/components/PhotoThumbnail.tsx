import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { photoExists } from '../services/photoStorage';

const THUMBNAIL_SIZE = 56;

interface PhotoThumbnailProps {
  uri: string;
  accessibilityLabel: string;
}

export default function PhotoThumbnail({ uri, accessibilityLabel }: PhotoThumbnailProps) {
  const [failed, setFailed] = useState(() => !photoExists(uri));

  // Recalcula al cambiar la uri: el estado inicial solo se evalúa en el primer render.
  useEffect(() => {
    setFailed(!photoExists(uri));
  }, [uri]);

  if (failed) {
    return <View style={styles.placeholder} accessibilityLabel={accessibilityLabel} />;
  }

  return (
    <Image
      source={{ uri }}
      style={styles.thumbnail}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  placeholder: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
});
