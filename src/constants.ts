import {
  concatMap,
  distinctUntilChanged,
  EMPTY,
  finalize,
  map,
  of,
  ReplaySubject,
  share,
  shareReplay,
  tap,
} from 'rxjs';

import { InitialMeta } from './utils/initial-meta';

import type { Editor } from 'tldraw';

const editorSubject = new ReplaySubject<Editor | undefined>(1);

export function setEditor(editor?: Editor) {
  editorSubject.next(editor);
}

export const nullableEditor$ = editorSubject.pipe(share());

export const editor$ = nullableEditor$.pipe(
  concatMap((v) => (v ? of(v) : EMPTY)),
  distinctUntilChanged(),
  shareReplay(1),
);

let initialMeta: InitialMeta | null = null;
function cleanUpMeta() {
  initialMeta?.clear();
  initialMeta = null;
}

export const initialMeta$ = editor$.pipe(
  tap(cleanUpMeta),
  map((editor) => (initialMeta = new InitialMeta(editor))),
  finalize(cleanUpMeta),
  shareReplay(1),
);
// at least one subscriber
initialMeta$.subscribe();
