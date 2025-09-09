import { useCallback, useEffect, useRef, useState } from 'react';
import { Subject, combineLatest, finalize, map, race, share, switchMap, take, tap, timer } from 'rxjs';

import type { MouseEvent } from 'react';
import type { Observable } from 'rxjs';

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
          const ajax$ = actionRef.current(e).pipe(take(1), share());

          const notifier$ = race(ajax$.pipe(map(() => false)), timer(delay).pipe(map(() => true))).pipe(
            tap((val) => setPending(val)),
          );

          return combineLatest([ajax$, notifier$]).pipe(
            finalize(() => {
              setWorking(false);
              setPending(false);
            }),
            map((v) => v[0]),
          );
        }),
      )
      .subscribe();
    return () => subscription.unsubscribe();
  }, [delay, subject]);

  return [handleEvent, pending, working] as const;
};
