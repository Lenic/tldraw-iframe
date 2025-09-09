import { DefaultToolbar, DefaultToolbarContent } from 'tldraw';

import { Popover } from '../components';
import { CreateIFrame } from './components/CreateIFrame';

export function Toolbar(props: any) {
  return (
    <DefaultToolbar {...props}>
      <Popover
        placement="top"
        offsetY={10}
        render={(onClose) => <CreateIFrame onClose={onClose} />}
      >
        <button className='px-3 h-10 bg-gray-600 text-white rounded-lg ml-1'>
          Create IFrame
        </button>
      </Popover>

      <DefaultToolbarContent />
    </DefaultToolbar>
  );
}
