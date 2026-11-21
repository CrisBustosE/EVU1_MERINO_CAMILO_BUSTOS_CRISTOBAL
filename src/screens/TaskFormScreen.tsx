import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { Task } from '../types';
import { COLORS, SPACING, STRINGS, LIMITS } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PhotoPicker from '../components/PhotoPicker';
import FormActions from '../components/FormActions';
import { usePhotoAttachment } from '../hooks/usePhotoAttachment';
import LocationField from '../components/LocationField';
import { useLocationCapture } from '../hooks/useLocationCapture';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { hapticSuccess } from '../services/haptics';

interface TaskFormScreenProps extends NativeStackScreenProps<RootStackParamList, 'TaskForm'> {
  onSave: (task: Task) => void;
}

export default function TaskFormScreen({ route, navigation, onSave }: TaskFormScreenProps) {
  const existing = route.params?.task;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [titleError, setTitleError] = useState(false);
  const photo = usePhotoAttachment(existing?.photoUri);
  const place = useLocationCapture({ location: existing?.location, address: existing?.address });
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const descriptionRef = useRef<React.ComponentRef<typeof TextInput>>(null);

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
      ...existing,
      id: existing?.id ?? Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      createdAt: existing?.createdAt ?? Date.now(),
      photoUri: photo.photoUri,
      location: place.location,
      address: place.address,
    };
    hapticSuccess();
    onSave(task);
    photo.commit(photo.photoUri);
    navigation.goBack();
  }

  const isAndroid = Platform.OS === 'android';
  // Único lugar del cálculo del offset inferior del pie fijo (Android): ajustar aquí si
  // al probar en dispositivo real sobra o falta espacio. Medido en dispositivo real:
  // `keyboardHeight` (evento `keyboardDidShow`) NO incluye la barra de navegación del
  // sistema en edge-to-edge (el teclado la cubre mostrando ~135 px de más sin este ajuste),
  // así que con el teclado visible hay que sumar `insets.bottom`. Con el teclado oculto,
  // el pie usa solo `insets.bottom`.
  const footerBottomPadding = keyboardHeight > 0 ? keyboardHeight + insets.bottom : insets.bottom;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: SPACING.md + (isAndroid ? 0 : insets.bottom) },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={isAndroid ? 'none' : 'interactive'}
        automaticallyAdjustKeyboardInsets
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
          returnKeyType="next"
          onSubmitEditing={() => descriptionRef.current?.focus()}
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
          ref={descriptionRef}
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

        <View style={styles.blocks}>
          {/* Bloque de foto adjunta (Unidad 2) */}
          <PhotoPicker
            photoUri={photo.photoUri}
            permissionStatus={photo.permissionStatus}
            busy={photo.busy}
            hasError={photo.error !== undefined}
            onTakePhoto={photo.takePhoto}
            onPickFromGallery={photo.pickFromGallery}
            onRemovePhoto={photo.removePhoto}
          />
          <LocationField
            location={place.location}
            address={place.address}
            permissionStatus={place.permissionStatus}
            busy={place.busy}
            error={place.error}
            readOnly={existing !== undefined}
            onAdd={place.capture}
            onRemove={place.remove}
          />
          {/* En Android, FormActions se renderiza fuera del ScrollView (pie fijo, ver más abajo). */}
          {!isAndroid && (
            <FormActions onCancel={() => navigation.goBack()} onSave={handleSave} />
          )}
        </View>
      </ScrollView>
      {isAndroid && (
        <View style={[styles.footer, { paddingBottom: footerBottomPadding }]}>
          <FormActions onCancel={() => navigation.goBack()} onSave={handleSave} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  // Pie fijo con los botones Cancelar/Guardar, solo Android: fuera del ScrollView para
  // que quede siempre visible justo encima del teclado (ver footerBottomPadding).
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
  },
  // Separación vertical uniforme entre foto, ubicación y botones; los hijos no declaran margen propio.
  blocks: {
    gap: SPACING.md,
    marginTop: SPACING.md,
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
});
