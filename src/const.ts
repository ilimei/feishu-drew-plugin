import { getWord, LangKey } from './i18n';

export enum ExportFileType {
  JSON = 'JSON',
  PNG = 'png',
  SVG = 'svg'
}

export const FileTypeTip = {
  [ExportFileType.JSON]: LangKey.export_json,
  [ExportFileType.SVG]: LangKey.export_svg,
  [ExportFileType.PNG]: LangKey.export_png,
}