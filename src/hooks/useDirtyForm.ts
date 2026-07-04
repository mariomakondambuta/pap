import { useCallback, useRef, useState } from 'react';

/**
 * Tracks a snapshot of form state so callers can show/hide an "unsaved changes" bar
 * and offer a discard action, mirroring the produto-editar dirty-tracking pattern.
 */
export function useDirtyForm<T extends Record<string, unknown>>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const snapshot = useRef<T>(initial);
  const [dirty, setDirty] = useState(false);

  const update = useCallback((patch: Partial<T>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      const isDirty = Object.keys(snapshot.current).some((key) => snapshot.current[key] !== next[key]);
      setDirty(isDirty);
      return next;
    });
  }, []);

  const commit = useCallback((next: T) => {
    snapshot.current = next;
    setState(next);
    setDirty(false);
  }, []);

  const discard = useCallback(() => {
    setState(snapshot.current);
    setDirty(false);
  }, []);

  return { state, update, commit, discard, dirty };
}
