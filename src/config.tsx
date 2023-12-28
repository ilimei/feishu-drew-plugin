import './config.less';
import React from 'react';
import { Alert, Button, Form, Modal, Select } from 'antd';
import { Editor, getSvgAsImage } from '@tldraw/tldraw';
import { bitable, FieldType, IAttachmentField, ToastType } from '@lark-base-open/js-sdk';
import { ExportFileType, FileTypeTip } from './const';
import { getWord, LangKey } from './i18n';
import { isJsonFile } from './utils';

export enum ModalType {
  import = 'import',
  export = 'export',
}

export interface ConfigModalProps {
  visible: boolean;
  editor: Editor;
  closeModal: () => void;
  modalType: ModalType,
}

type FiledOption = {
  value: string;
  label: string;
}

type FileOption = {
  value: number;
  label: string;
}

export interface ConfigModalState {
  loadingField: boolean;
  loadingFile: boolean;
  fieldId?: string;
  recordId?: string;
  fileIndex?: number;
  fieldOptionList?: FiledOption[];
  fileOptionsList?: FileOption[];
  okLoading: boolean;
  exportFileType?: ExportFileType;
}

export class ConfigModal extends React.Component<ConfigModalProps, ConfigModalState> {
  constructor(props: ConfigModalProps) {
    super(props);
    this.state = {
      loadingField: true,
      loadingFile: false,
      okLoading: false,
    }
  }

  componentDidMount() {
    this.updateFieldOptions();
  }

  componentDidUpdate(prevProps: Readonly<ConfigModalProps>) {
    if (prevProps.visible !== this.props.visible) {
      this.updateFieldOptions();
    }
  }

  private updateFieldOptions = async () => {
    const table = await bitable.base.getActiveTable();
    const attachmentFieldList = await table.getFieldListByType<IAttachmentField>(FieldType.Attachment);
    const fieldOptionList: FiledOption[] = [];
    for (const field of attachmentFieldList) {
      if (await field.getOnlyMobile()) {
        continue;
      }
      fieldOptionList.push({
        value: field.id,
        label: await field.getName(),
      })
    }
    this.setState({
      loadingField: false,
      fieldOptionList,
    })
  }

  private getRecordSelect = async () => {
    const { tableId, viewId } = await bitable.base.getSelection();
    const recordIdList = await bitable.ui.selectRecordIdList(tableId!, viewId!);
    if (recordIdList.length > 1) {
      bitable.ui.showToast({
        toastType: ToastType.warning,
        message: getWord(LangKey.only_one_record)
      });
    }
    this.setState({ recordId: recordIdList[0], fileIndex: undefined }, this.updateFileList);
  }

  private updateFileList = async () => {
    this.setState({
      loadingFile: true,
    })
    const { fieldId, recordId } = this.state;
    if (!fieldId || !recordId) {
      this.setState({
        loadingFile: false,
      })
      return;
    }
    const table = await bitable.base.getActiveTable();
    const attachmentField = await table.getField<IAttachmentField>(fieldId);
    const attachmentFileList = await attachmentField.getValue(recordId);
    if (!attachmentFileList) {
      this.setState({
        loadingFile: false,
      })
      return;
    }
    this.setState({
      loadingFile: false,
      fileOptionsList: attachmentFileList.map(((file, index) => ({
        value: index,
        label: file.name
      })) || []).filter(item => isJsonFile(item.label)),
    })
  }

  private getButtonType = () => {
    return Boolean(this.state.recordId) ? 'primary' : 'default';
  }

  private getButtonTitle = () => {
    return Boolean(this.state.recordId) ? getWord(LangKey.has_select_record) : getWord(LangKey.no_select_record);
  }

  private renderModalContent = () => {
    const { loadingField, fieldOptionList } = this.state;
    return <>
      {this.renderTooltip()}
      <Form layout={'vertical'}>
        <Form.Item label={getWord(LangKey.please_select_field)} required>
          <Select loading={loadingField} options={fieldOptionList} onSelect={val => {
            this.setState({ fieldId: val, fileIndex: undefined }, this.updateFileList)
          }}/>
        </Form.Item>
        <Form.Item label={getWord(LangKey.please_select_record)} required>
          <Button type={this.getButtonType()} onClick={this.getRecordSelect}>{this.getButtonTitle()}</Button>
        </Form.Item>
        {this.getContentTypeUI()}
      </Form>
    </>
  }

  private renderTooltip = () => {
    return <Alert
      className={'config-tooltip'}
      showIcon
      message={getWord(LangKey.only_accept_attachment)}
      type="warning"
    />
  }

  private renderExportFileType = () => {
    const { exportFileType } = this.state;
    return <Form.Item label={getWord(LangKey.select_export_file_type)} required>
      <Select
        value={exportFileType}
        onSelect={val => this.setState({ exportFileType: val })}
        options={Object.values(ExportFileType).map(value => ({ value, label: getWord(FileTypeTip[value]) }))}/>
    </Form.Item>
  };

  private renderImportFieldSelect = () => {
    const { loadingFile, fileIndex, fileOptionsList } = this.state;
    return (
      <Form.Item label={getWord(LangKey.select_import_file)} required>
        <Select
          loading={loadingFile}
          value={fileIndex}
          options={fileOptionsList}
          onSelect={val => {
            this.setState({ fileIndex: val })
          }}/>
      </Form.Item>
    )
  };

  private getContentTypeUI = () => {
    const { modalType } = this.props;
    if (modalType === ModalType.export) {
      return this.renderExportFileType()
    }
    return this.renderImportFieldSelect()
  }

  private getSubmitText = () => {
    const { modalType } = this.props;
    if (modalType === ModalType.export) {
      return getWord(LangKey.import);
    }
    return getWord(LangKey.export);
  }

  private getSubmitEnable = () => {
    const { fieldId, recordId, fileIndex, exportFileType } = this.state;
    const { modalType } = this.props;
    if (modalType === ModalType.export) {
      return recordId && fieldId && exportFileType;
    }
    return typeof fileIndex === 'number' && fieldId && recordId;
  }

  private onClickOk = async () => {
    this.setState({ okLoading: true });
    const { modalType } = this.props;
    if (modalType === ModalType.export) {
      await this.onExport();
      this.setState({ okLoading: false }, this.onCloseModal);
      return;
    }
    await this.onImport();
    this.setState({ okLoading: false }, this.onCloseModal);
  }

  private onImport = async () => {
    const { fieldId, recordId, fileIndex } = this.state;
    if (!fieldId || !recordId || !(typeof fileIndex === 'number')) {
      return;
    }
    const table = await bitable.base.getActiveTable();
    const attachmentField = await table.getField<IAttachmentField>(fieldId);
    const attachmentUrls = await attachmentField.getAttachmentUrls(recordId) || [];
    const selectUrl = attachmentUrls[fileIndex];
    if (!selectUrl) {
      return;
    }
    // 获取 response
    const response = await fetch(selectUrl);
    // 获取 json 数据
    const json = await response.json();
    const { editor } = this.props;
    editor.store.loadSnapshot(json);
  }

  private onExport = async () => {
    const { exportFileType } = this.state;
    switch (exportFileType) {
      case ExportFileType.PNG:
        return await this.onExportImg();
      case ExportFileType.SVG:
        return await this.onExportSvg();
      default:
        return await this.onExportJSON();
    }
  }

  private getShapeIds = () => {
    const { editor } = this.props;
    const ids = editor.getSelectedShapeIds()
    return ids?.length ? ids : [...editor.getCurrentPageShapeIds()];
  }

  private onExportJSON = async () => {
    const { editor } = this.props;
    const data = editor.store.getSnapshot();
    if (!data) {
      bitable.ui.showToast({ toastType: ToastType.error, message: getWord(LangKey.need_file_export) })
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    const page = editor.getCurrentPage();
    const file = new File([blob], `${page.name || 'data'}.json`, {
      type: 'application/json',
      lastModified: Date.now()
    });
    await this.appendFile(file);
  };

  private appendFile = async (file: File) => {
    const { fieldId, recordId } = this.state;
    if (!recordId || !fieldId) {
      return;
    }
    const table = await bitable.base.getActiveTable();
    const token = await bitable.base.batchUploadFile([file]);
    const fileToken = token[0];
    const attachmentField = await table.getField<IAttachmentField>(fieldId);
    const attachmentVal = await attachmentField.getValue(recordId) || [];
    attachmentVal.push({
      type: file.type,
      name: file.name,
      token: fileToken,
      timeStamp: file.lastModified,
      size: file.size
    });
    await attachmentField.setValue(recordId, attachmentVal);
  }

  private onExportSvg = async () => {
    const { editor } = this.props;
    const svg = await editor.getSvg(this.getShapeIds())
    if (!svg) {
      bitable.ui.showToast({ toastType: ToastType.error, message: getWord(LangKey.need_file_export) })
      return;
    }
    const svgString = new XMLSerializer().serializeToString(svg);
    const page = editor.getCurrentPage();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const file = new File([svgBlob], `${page.name || 'data'}.svg`, { type: 'image/svg+xml' });
    await this.appendFile(file);
  };

  private onExportImg = async () => {
    const { editor } = this.props;
    const svg = await editor.getSvg(this.getShapeIds())
    if (!svg) {
      bitable.ui.showToast({ toastType: ToastType.error, message: getWord(LangKey.need_file_export) })
      return;
    }
    const imageBlob = await getSvgAsImage(svg, editor.environment.isSafari, {
      type: 'png',
      quality: 1,
      scale: 2,
    });
    if (!imageBlob) {
      bitable.ui.showToast({ toastType: ToastType.error, message: getWord(LangKey.need_file_export) })
      return;
    }
    const page = editor.getCurrentPage();
    const file = new File([imageBlob], `${page.name || 'data'}.png`, { type: 'image/png' });
    await this.appendFile(file);
  };

  private onCloseModal = () => {
    if (this.state.okLoading) {
      return;
    }
    const { closeModal } = this.props;
    this.setState({
      fieldId: undefined,
      recordId: undefined,
      exportFileType: undefined,
      fileIndex: undefined,
    })
    closeModal();
  }

  render() {
    const { visible } = this.props;
    const { okLoading } = this.state;
    return <>
      <Modal
        mask={false}
        onCancel={this.onCloseModal}
        open={visible}
        destroyOnClose={true}
        cancelText={getWord(LangKey.close)}
        okText={this.getSubmitText()}
        okButtonProps={{
          disabled: !this.getSubmitEnable(),
          onClick: this.onClickOk,
          loading: okLoading,
        }}
      >
        {this.renderModalContent()}
      </Modal>
    </>
  }
}