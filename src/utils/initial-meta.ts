import type { Editor, JsonObject, TLShape } from 'tldraw';

export class InitialMeta {
  private _list: Array<{
    action: (shape: TLShape) => JsonObject | undefined;
    order: number;
  }>;

  constructor(private editor: Editor) {
    this._list = [];

    this.editor.getInitialMetaForShape = (shape) => {
      for (let item of this._list) {
        const res = item.action(shape);
        if (res) return res;
      }

      return { createAt: Date.now() };
    };
  }

  addListener(action: (shape: TLShape) => JsonObject | undefined, order = 0) {
    const item = { action, order };
    this._list.push(item);

    return () => {
      const index = this._list.findIndex((v) => v === item);
      if (index >= 0) {
        this._list.splice(index, 1);
        return true;
      }
      return false;
    };
  }

  clear() {
    this._list = [];
  }
}
