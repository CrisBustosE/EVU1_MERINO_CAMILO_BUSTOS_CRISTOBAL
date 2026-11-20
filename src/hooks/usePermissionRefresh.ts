import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { isPermissionRejected } from '../services/permissions';
import type { PermissionStatus } from '../types';

/**
 * Al volver a primer plano con el aviso de permiso visible (denegado/bloqueado) relee el
 * estado: el aviso desaparece solo si el usuario concedió el permiso en los ajustes del sistema.
 */
export function usePermissionRefresh(
  status: PermissionStatus,
  readStatus: () => Promise<PermissionStatus>,
  onStatus: (status: PermissionStatus) => void
) {
  const statusRef = useRef(status);
  const readRef = useRef(readStatus);
  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    statusRef.current = status;
    readRef.current = readStatus;
    onStatusRef.current = onStatus;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      if (!isPermissionRejected(statusRef.current)) return;
      readRef.current().then(onStatusRef.current);
    });
    return () => subscription?.remove();
  }, []);
}
