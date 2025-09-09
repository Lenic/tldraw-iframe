import { Tldraw, createShapeId } from 'tldraw';
import 'tldraw/tldraw.css';
import { setEditor, editor$ } from './constants';

import { CardShapeUtil } from './shapes/card';
import { IframeShapeUtil } from './shapes/iframe';

const MyCustomShapes = [CardShapeUtil, IframeShapeUtil];

editor$.subscribe((editor) => {
  debugger;
  editor.createShapes([{ id: createShapeId(), type: 'iframe' }]);

  editor.selectAll();

  editor.zoomToSelection({
    animation: { duration: 618 },
  });
});

function App() {
  return (
    <div className="absolute inset-0">
      <Tldraw onMount={setEditor} shapeUtils={MyCustomShapes} />
    </div>
  );
}

export default App;
