import { Tldraw } from 'tldraw';

import { setEditor } from './constants';
import { CardShapeUtil } from './shapes/card';
import { IframeShapeUtil } from './shapes/iframe';
import { Toolbar } from './toolbar';

import type { TLComponents } from 'tldraw';

import 'tldraw/tldraw.css';
import './index.css';

const components: TLComponents = { Toolbar };
const shapes = [CardShapeUtil, IframeShapeUtil];

function App() {
  return (
    <div className="absolute inset-0">
      <Tldraw onMount={setEditor} shapeUtils={shapes} components={components} />
    </div>
  );
}
export default App;
