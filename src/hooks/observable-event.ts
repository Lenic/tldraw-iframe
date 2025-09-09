import { useCallback, useEffect, useRef, useState } from 'react';
import { Subject, catchError, finalize, of, switchMap, type Observable } from 'rxjs';

import type { MouseEvent } from 'react';

export const useObservableEvent = <T extends HTMLElement = HTMLElement, TEvent = MouseEvent<T>>(
  action: (event: TEvent) => Observable<any>,
  error?: (err: unknown) => any,
  delay = 300,
) => {
  const actionRef = useRef(action);
  actionRef.current = action;

  const errorActionRef = useRef<((err: unknown) => any) | undefined>(void 0);
  errorActionRef.current = error;

  const [subject] = useState(() => new Subject<TEvent>());
  const handleEvent = useCallback((e: TEvent) => subject.next(e), [subject]);

  const [working, setWorking] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const subscription = subject
      .pipe(
        switchMap((e) => {
          setWorking(true);
          let token: ReturnType<typeof setTimeout> | null = setTimeout(() => {
            token = null;
            setPending(true);
          }, delay);

          return actionRef.current(e).pipe(
            finalize(() => {
              setWorking(false);

              if (token) clearTimeout(token);
              setPending(false);
            }),
            catchError((err) => {
              if (errorActionRef.current) {
                errorActionRef.current(err);
              } else {
                console.error('useAsyncEvent: ', e);
              }

              return of();
            }),
          );
        }),
      )
      .subscribe();
    return () => subscription.unsubscribe();
  }, [delay, subject]);

  return [handleEvent, pending, working] as const;
};
