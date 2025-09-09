import type { Editor, TLBaseShape } from 'tldraw';

import { HTMLContainer, Rectangle2d, ShapeUtil } from 'tldraw';
import { initialMeta$ } from '../constants';

export type CardShape = TLBaseShape<'card', { w: number; h: number }> & {
  createAt: number;
};

export class CardShapeUtil extends ShapeUtil<CardShape> {
  static override type = 'card' as const;

  constructor(editor: Editor) {
    super(editor);

    let subscription: (() => void) | null = null;
    initialMeta$.subscribe({
      next(meta) {
        subscription = meta.addListener((shape) => {
          if (shape.type === CardShapeUtil.type) {
            return {
              typeName: 'CardShape',
              createAt: Date.now(),
            };
          }
        });
      },
      error() {
        subscription?.();
      },
      complete() {
        subscription?.();
      },
    });
  }

  getDefaultProps(): CardShape['props'] {
    return {
      w: 100,
      h: 100,
    };
  }

  getGeometry(shape: CardShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: CardShape) {
    return <HTMLContainer>Hello</HTMLContainer>;
  }

  indicator(shape: CardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
