import type { Editor } from 'tldraw';

import {
  distinctUntilChanged,
  filter,
  map,
  ReplaySubject,
  share,
  shareReplay,
  tap,
} from 'rxjs';
import { InitialMeta } from './utils/initial-meta';

const editorSubject = new ReplaySubject<Editor | undefined>(1);

export function setEditor(editor?: Editor) {
  editorSubject.next(editor);
}

export const nullableEditor$ = editorSubject.pipe(share());

export const editor$ = nullableEditor$.pipe(
  filter((v) => !!v),
  distinctUntilChanged(),
  shareReplay(1)
);

let initialMeta: InitialMeta | null = null;
export const initialMeta$ = editor$.pipe(
  tap(() => {
    initialMeta?.clear();
  }),
  map((editor) => new InitialMeta(editor)),
  tap((meta) => {
    initialMeta = meta;
  }),
  shareReplay(1)
);
initialMeta$.subscribe();
