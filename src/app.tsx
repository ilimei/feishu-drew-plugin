import { Editor, Tldraw, TLUiOverrides, toolbarItem, LANGUAGES } from '@tldraw/tldraw';
import React from 'react';
import { Spin } from 'antd';
import { customAssetUrls, ExportTool, ImportTool } from './bitable-tool';
import { ConfigModal, ModalType } from './config';
import { getWord, LangKey } from './i18n';
import { Locale } from '@lark-base-open/js-sdk';

interface PageState {
  loading: boolean;
  editor?: Editor;
  showConfig: boolean;
  modalType: ModalType;
}

interface PageProps {
  isDarK: boolean;
  lang: Locale;
}

export class Page extends React.Component<PageProps, PageState> {
  constructor(props: PageProps) {
    super(props);
    this.state = {
      loading: false,
      showConfig: false,
      modalType: ModalType.export,
    }
  }

  private onClickExport = (editor: Editor) => {
    this.setState({
      editor,
      showConfig: true,
      modalType: ModalType.export,
    });
  };

  private onClickImport = (editor: Editor) => {
    this.setState({
      editor,
      showConfig: true,
      modalType: ModalType.import,
    });
  };


  private config: TLUiOverrides = {
    tools: (editor, tools) => {
      return {
        ...tools,
        export: {
          id: 'bitable-export',
          label: getWord(LangKey.export_to_bitable),
          readonlyOk: false,
          icon: 'bitable-tool-export',
          onSelect: () => {
            this.onClickExport(editor);
          },
        },
        import: {
          id: 'bitable-import',
          label: getWord(LangKey.import_from_bitable),
          readonlyOk: false,
          icon: 'bitable-tool-import',
          onSelect: () => {
            this.onClickImport(editor);
          },
        },
      }
    },
    toolbar: (_editor, toolbarItems, { tools }) => {
      toolbarItems.splice(0, 0, toolbarItem(tools.import))
      toolbarItems.splice(0, 0, toolbarItem(tools.export))
      return toolbarItems
    },
  }

  closeModal = () => {
    this.setState({ showConfig: false });
  }

  private onMount = (editor: Editor) => {
    const { isDarK, lang } = this.props;
    editor.user.updateUserPreferences({ isDarkMode: isDarK, locale: lang === 'zh-CN' ? 'zh-cn' : 'en' });
  }

  render() {
    const { loading, showConfig, editor, modalType } = this.state;
    return (
      <>
        {editor ? <ConfigModal
            modalType={modalType}
            visible={showConfig}
            editor={editor}
            closeModal={this.closeModal}/>
          : <></>
        }
        <Spin spinning={loading}>
          <div style={{ position: 'fixed', inset: 0 }}>
            <Tldraw
              onMount={this.onMount}
              tools={[ImportTool, ExportTool]}
              overrides={this.config}
              assetUrls={customAssetUrls}
            />
          </div>
        </Spin>
      </>
    );
  }
}
