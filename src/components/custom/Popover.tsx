import { createPopper } from '@popperjs/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  fromEvent,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';

import { useObservableRef } from '../../hooks';

import { Portal } from './Portal';

import type { Instance, Placement } from '@popperjs/core';
import type { FC, ReactNode } from 'react';

interface PopoverProps {
  children: ReactNode;
  offsetX?: number;
  offsetY?: number;
  className?: string;
  render: (onClose: () => void) => ReactNode;
  placement?: Placement;
}

export const Popover: FC<PopoverProps> = (props) => {
  const { children, render, placement = 'bottom', offsetX = 0, offsetY = 8 } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [open$] = useState(() => new BehaviorSubject(isOpen));
  open$.next(isOpen);

  const [referenceRef, reference$] = useObservableRef<HTMLDivElement | null>(null);
  const [popperRef, popper$] = useObservableRef<HTMLDivElement | null>(null);

  const handleClearInstance = useCallback(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }
  }, []);

  const instanceRef = useRef<Instance | null>(null);
  useEffect(() => handleClearInstance, [handleClearInstance]);

  const togglePopover = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const subscription = open$
      .pipe(
        distinctUntilChanged(),
        switchMap((open) => {
          if (!open) return EMPTY;

          return combineLatest([
            fromEvent(window, 'mousedown'),
            reference$.pipe(concatMap((el) => (el ? of(el) : EMPTY))),
            popper$.pipe(concatMap((el) => (el ? of(el) : EMPTY))),
          ]).pipe(
            filter(
              ([event, reference, popper]) =>
                !reference.contains(event.target as Node) && !popper.contains(event.target as Node),
            ),
            take(1),
            tap(() => {
              setIsOpen(false);
            }),
          );
        }),
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [open$, reference$, popper$]);

  useEffect(() => {
    const subscription = open$
      .pipe(
        distinctUntilChanged(),
        switchMap((open) => {
          if (!open) return EMPTY;

          return combineLatest([
            reference$.pipe(concatMap((el) => (el ? of(el) : EMPTY))),
            popper$.pipe(concatMap((el) => (el ? of(el) : EMPTY))),
          ]).pipe(
            tap(handleClearInstance),
            map(([reference, popper]) =>
              createPopper(reference, popper, {
                placement,
                modifiers: [
                  { name: 'offset', options: { offset: [offsetX, offsetY] } },
                  { name: 'preventOverflow', options: { boundary: 'viewport' } },
                ],
              }),
            ),
            tap((instance) => (instanceRef.current = instance)),
            finalize(handleClearInstance),
          );
        }),
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [open$, placement, offsetX, offsetY, reference$, popper$, handleClearInstance]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className={props.className ?? ''}>
      <div ref={referenceRef} onClick={togglePopover} style={{ display: 'inline-block' }}>
        {children}
      </div>

      {isOpen && (
        <Portal>
          <div ref={popperRef} style={{ zIndex: 9999 }}>
            {render(handleClose)}
          </div>
        </Portal>
      )}
    </div>
  );
};
