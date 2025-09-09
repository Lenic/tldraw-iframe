import { useCallback, useMemo, useState } from 'react';
import { BehaviorSubject } from 'rxjs';

export function useObservableRef<T>(defaultValue: T) {
  const [trigger] = useState(() => new BehaviorSubject(defaultValue));

  const handleSetValue = useCallback((nextValue: T) => trigger.next(nextValue), [trigger]);
  const target$ = useMemo(() => trigger.asObservable(), [trigger]);

  return [handleSetValue, target$] as const;
}
