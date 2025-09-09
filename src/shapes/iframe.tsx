import type {
  Editor,
  Geometry2d,
  TLBaseShape,
  TLGeometryOpts,
  TLResizeInfo,
} from 'tldraw';

import { HTMLContainer, Rectangle2d, resizeBox, ShapeUtil } from 'tldraw';
import { initialMeta$ } from '../constants';

// 1. 定义 shape 的数据类型
export type IframeShape = TLBaseShape<
  'iframe',
  { url: string; w: number; h: number }
> & { createAt: number; updateAt: number };

// 2. 定义 shape 工具
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
      url: 'https://www.baidu.com/', // 默认链接
      w: 1250,
      h: 726,
    };
  }

  getGeometry(shape: IframeShape, _opts?: TLGeometryOpts): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // 3. 渲染 shape
  component(shape: IframeShape) {
    const { url, w, h } = shape.props;

    return (
      <HTMLContainer>
        <div
          style={{
            width: `${w}px`,
            height: `${h}px`,
            pointerEvents: 'all',
          }}
        >
          <iframe
            src={url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: IframeShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // 4. 是否可以绑定文本
  canBind = () => false;

  // 5. 是否可以调整大小
  canResize = () => true;

  onResize(shape: IframeShape, info: TLResizeInfo<IframeShape>) {
    return resizeBox(shape, info);
  }

  // 6. 是否可以旋转
  canRotate = () => true;
}
