import {
  StateNode,
  TLUiAssetUrlOverrides,
} from '@tldraw/tldraw'
import ImportSVG from '../import.svg';
import ExportSVG from '../export.svg';

export class ExportTool extends StateNode {
  static override id = 'bitable-export'
  static override initial = 'idle'
}

export class ImportTool extends StateNode {
  static override id = 'bitable-import'
  static override initial = 'idle'
}

export const customAssetUrls: TLUiAssetUrlOverrides = {
  icons: {
    'bitable-tool-import': ImportSVG,
    'bitable-tool-export': ExportSVG,
  },
}
