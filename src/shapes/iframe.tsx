import type { Editor, Geometry2d, TLBaseShape, TLGeometryOpts, TLResizeInfo } from 'tldraw';

import { HTMLContainer, Rectangle2d, resizeBox, ShapeUtil } from 'tldraw';

import { initialMeta$ } from '../constants';

export type IframeShape = TLBaseShape<'iframe', { url: string; w: number; h: number; title: string }> & {
  createAt: number;
  updateAt: number;
};

export class IframeShapeUtil extends ShapeUtil<IframeShape> {
  static type = 'iframe' as const;

  constructor(editor: Editor) {
    super(editor);

    let subscription: (() => void) | null = null;
    initialMeta$.subscribe({
      next(meta) {
        subscription = meta.addListener((shape) => {
          if (shape.type === IframeShapeUtil.type) {
            const now = Date.now();
            return {
              typeName: 'IframeShapeUtil',
              createAt: now,
              updateAt: now,
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

  getDefaultProps(): IframeShape['props'] {
    return {
      url: 'https://www.baidu.com/',
      w: 1250,
      h: 726,
      title: 'Untitled',
    };
  }

  getGeometry(shape: IframeShape, _opts?: TLGeometryOpts): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: IframeShape) {
    const { url, w, h, title } = shape.props;

    return (
      <HTMLContainer>
        <div
          className="relative"
          style={{
            width: `${w}px`,
            height: `${h}px`,
            pointerEvents: 'all',
          }}
        >
          <div className="absolute -top-5 left-0 bg-[#3182ed] text-white h-5 leading-5 px-3 rounded-t-sm">{title}</div>
          <iframe
            src={url}
            className='box-border border-2 border-[#3182ed] w-full h-full'
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: IframeShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  canBind = () => false;

  canResize = () => true;

  onResize(shape: IframeShape, info: TLResizeInfo<IframeShape>) {
    return resizeBox(shape, info);
  }

  canRotate = () => true;
}
