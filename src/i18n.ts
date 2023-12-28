import { Locale } from '@lark-base-open/js-sdk';

export let lang: Locale;

export const setLang = (val: Locale) => {
  lang = val;
}

export const enum LangKey {
  only_one_record = 'only_one_record',
  has_select_record = 'has_select_record',
  no_select_record = 'no_select_record',
  please_select_field = 'please_select_field',
  please_select_record = 'please_select_record',
  only_accept_attachment = 'only_accept_attachment',
  select_export_file_type = 'select_export_file_type',
  select_import_file = 'select_import_file',
  import = 'import',
  export = 'export',
  need_file_export = 'need_file_export',
  import_from_bitable = 'import_from_bitable',
  export_to_bitable = 'export_to_bitable',
  close =  'close',
  export_json = 'export_json',
  export_svg = 'export__svg',
  export_png = 'export_png',
}

const ZhLang = {
  [LangKey.only_one_record]: '只允许选择一条记录, 默认填充选择的第一条记录',
  [LangKey.has_select_record]: '已选择记录',
  [LangKey.no_select_record]: '未选择记录',
  [LangKey.please_select_field]: '请选择字段',
  [LangKey.please_select_record]: '请选择记录',
  [LangKey.only_accept_attachment]: '仅支持选择附件类型字段, 选择文件的时候不对文件内容做校验',
  [LangKey.select_export_file_type]: '请选择导出的文件类型',
  [LangKey.select_import_file]: '请选择导入的文件(请先选择上述的字段和记录)',
  [LangKey.import]: '导入',
  [LangKey.export]: '导出',
  [LangKey.need_file_export]: '缺少需要导出的文件',
  [LangKey.import_from_bitable]: '从多维表格中导入',
  [LangKey.export_to_bitable]: '导出到多维表格',
  [LangKey.close]: '关闭',
  [LangKey.export_json]: '将整个工作区导出为 JSON 格式(可以二次编辑)',
  [LangKey.export_svg]: '导出为 SVG 格式，导出之后拉伸不变形',
  [LangKey.export_png]: '导出为图片格式',
}

const EnLang = {
  [LangKey.only_one_record]: 'Only one record is allowed, the first selected record is filled in by default',
  [LangKey.has_select_record]: 'Record has been selected',
  [LangKey.no_select_record]: 'No record selected',
  [LangKey.please_select_field]: 'Please select a field',
  [LangKey.please_select_record]: 'Please select a record',
  [LangKey.only_accept_attachment]: 'Only attachment type fields are supported, no validation is done on the file content when selecting a file',
  [LangKey.select_export_file_type]: 'Please select the file type for export',
  [LangKey.select_import_file]: 'Please select the file to import (please select the above fields and records first)',
  [LangKey.import]: 'Import',
  [LangKey.export]: 'Export',
  [LangKey.need_file_export]: 'Missing file for export',
  [LangKey.import_from_bitable]: 'Import from Bitable',
  [LangKey.export_to_bitable]: 'Export to Bitable',
  [LangKey.close]: 'close',
  [LangKey.export_json]: 'Export the entire workspace as JSON format (can be edited again)',
  [LangKey.export_svg]: 'Export as SVG format, no deformation after stretching',
  [LangKey.export_png]: 'Export as image format',
}

export const getWord = (key: LangKey) => {
  if (lang === 'zh-CN') {
    return ZhLang[key];
  } else {
    return EnLang[key];
  }
}