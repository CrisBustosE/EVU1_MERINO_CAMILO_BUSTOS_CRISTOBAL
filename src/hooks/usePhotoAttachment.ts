import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  takePhoto as takePhotoFromCamera,
  pickFromGallery as pickFromGalleryService,
  getCameraPermissionStatus,
} from '../services/photoPicker';
import { deletePhoto } from '../services/photoStorage';
import { isPermissionRejected } from '../services/permissions';
import type { PermissionStatus } from '../types';

export function usePhotoAttachment(initialPhotoUri?: string) {
  const originalUriRef = useRef(initialPhotoUri);
  const newUrisRef = useRef<string[]>([]);
  const settledRef = useRef(false);

  const [photoUri, setPhotoUri] = useState<string | undefined>(initialPhotoUri);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const permissionStatusRef = useRef(permissionStatus);
  useEffect(() => {
    permissionStatusRef.current = permissionStatus;
  }, [permissionStatus]);

  // Al volver a primer plano con el aviso de permiso visible: relee el estado,
  // así el mensaje desaparece solo si el usuario lo concedió en los ajustes del sistema.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      if (!isPermissionRejected(permissionStatusRef.current)) return;
      getCameraPermissionStatus().then(setPermissionStatus);
    });
    return () => subscription?.remove();
  }, []);

  // Al desmontar sin commit/discard explícito: borra las copias nuevas de esta sesión.
  useEffect(() => {
    return () => {
      if (settledRef.current) return;
      newUrisRef.current.forEach((uri) => {
        deletePhoto(uri);
      });
    };
  }, []);

  const takePhoto = useCallback(async () => {
    setBusy(true);
    setError(undefined);
    try {
      const result = await takePhotoFromCamera();
      if (result.status === 'ok') {
        newUrisRef.current.push(result.uri);
        setPhotoUri(result.uri);
        setPermissionStatus('granted');
      } else if (result.status === 'denied' || result.status === 'blocked') {
        setPermissionStatus(result.status);
      } else if (result.status === 'error') {
        setError('photoError');
      } else {
        setPermissionStatus('granted');
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    setBusy(true);
    setError(undefined);
    try {
      const result = await pickFromGalleryService();
      if (result.status === 'ok') {
        newUrisRef.current.push(result.uri);
        setPhotoUri(result.uri);
      } else if (result.status === 'error') {
        setError('photoError');
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const removePhoto = useCallback(() => {
    setPhotoUri(undefined);
  }, []);

  // Guardado: borra el archivo original si se quitó/reemplazó y las copias intermedias no finales.
  const commit = useCallback(async (finalUri?: string) => {
    settledRef.current = true;
    const original = originalUriRef.current;
    const cleanupTasks: Promise<void>[] = [];
    if (original && original !== finalUri) {
      cleanupTasks.push(deletePhoto(original));
    }
    newUrisRef.current
      .filter((uri) => uri !== finalUri)
      .forEach((uri) => cleanupTasks.push(deletePhoto(uri)));
    newUrisRef.current = [];
    await Promise.all(cleanupTasks);
  }, []);

  // Descartar: borra solo las copias nuevas de esta sesión; conserva el archivo original.
  const discard = useCallback(() => {
    settledRef.current = true;
    newUrisRef.current.forEach((uri) => {
      deletePhoto(uri);
    });
    newUrisRef.current = [];
  }, []);

  return {
    photoUri,
    permissionStatus,
    busy,
    error,
    takePhoto,
    pickFromGallery,
    removePhoto,
    commit,
    discard,
  };
}
