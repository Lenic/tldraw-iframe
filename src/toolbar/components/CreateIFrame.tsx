import { memo, useEffect } from 'react';
import { EMPTY, concatMap, finalize, map, of, take, tap, withLatestFrom } from 'rxjs';
import { createShapeId } from 'tldraw';

import { editor$ } from '../../constants';
import { useObservableEvent, useObservableRef } from '../../hooks';
import { IframeShapeUtil } from '../../shapes/iframe';

import type { FormEvent } from 'react';

function CreateIFrameCore({ onClose }: { onClose: () => void }) {
  const [setInput, input$] = useObservableRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const subscription = input$
      .pipe(
        concatMap((v) => (v ? of(v) : EMPTY)),
        take(1),
      )
      .subscribe((input) => input.focus());
    return () => subscription.unsubscribe();
  }, [input$]);

  // Save 按钮的处理函数
  const [handleSubmit, pending] = useObservableEvent((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id = createShapeId();
    const data = new FormData(e.currentTarget);
    const url = data.get('url') as string;
    if (!url) return of(void 0);

    return editor$.pipe(
      take(1),
      tap((editor) =>
        editor.createShapes([{ id, type: IframeShapeUtil.type, props: { url } }]),
      ),
      finalize(() => {
        onClose();

        editor$
          .pipe(
            take(1),
            map((editor) => editor.getShape(id)),
            concatMap((shape) => (shape ? of(shape) : EMPTY)),
            withLatestFrom(editor$),
          )
          .subscribe(([shape, editor]) => {
            editor.select(shape);
            editor.zoomToSelection({
              animation: { duration: 618 },
            });
          });
      }),
    );
  });

  return (
    <form className='bg-gray-600 rounded-2xl p-4 text-white space-y-2 text-sm' onSubmit={handleSubmit}>
      <header>Target URL Address</header>
      <input
        ref={setInput}
        type="text"
        name="url"
        id="input-iframe"
        className='py-1 px-2 outline-white outline-1 rounded-sm w-[256px]'
        placeholder="Input Target URL Address"
        disabled={pending}
      />
      <footer className='py-1 text-right'>
        <button type="submit" disabled={pending}>
          {pending ? 'Submit...' : 'Submit'}
        </button>
      </footer>
    </form>
  );
}

export const CreateIFrame = memo(CreateIFrameCore);
