import { useCallback, useState } from 'react';
import { captureLocation, getLocationPermissionStatus } from '../services/location';
import { usePermissionRefresh } from './usePermissionRefresh';
import type { PermissionStatus, TaskLocation } from '../types';

export type LocationErrorKey = 'locationTimeout' | 'locationError';

interface InitialLocation {
  location?: TaskLocation;
  address?: string;
}

export function useLocationCapture(initial: InitialLocation = {}) {
  const [location, setLocation] = useState<TaskLocation | undefined>(initial.location);
  const [address, setAddress] = useState<string | undefined>(initial.address);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<LocationErrorKey | undefined>();

  usePermissionRefresh(permissionStatus, getLocationPermissionStatus, setPermissionStatus);

  const capture = useCallback(async () => {
    setBusy(true);
    setError(undefined);
    try {
      const result = await captureLocation();
      if (result.status === 'ok') {
        setLocation(result.location);
        setAddress(result.address);
        setPermissionStatus('granted');
      } else if (result.status === 'denied' || result.status === 'blocked') {
        setPermissionStatus(result.status);
      } else {
        setPermissionStatus('granted');
        setError(result.status === 'timeout' ? 'locationTimeout' : 'locationError');
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const remove = useCallback(() => {
    setLocation(undefined);
    setAddress(undefined);
    setError(undefined);
  }, []);

  return { location, address, permissionStatus, busy, error, capture, remove };
}
