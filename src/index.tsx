import './index.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Page } from './app';
import { ConfigProvider, Spin, theme } from 'antd';
import { bitable, Locale, ThemeModeType } from '@lark-base-open/js-sdk';
import { setLang } from './i18n';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

const LoadingPage = () => {
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [curLang, setCurLang] = useState<Locale>('zh-CN');
  const init = async () => {
    const lang = await bitable.bridge.getLocale();
    const theme = await bitable.bridge.getTheme();
    setLang(lang);
    setIsDark(theme === ThemeModeType.DARK);
    setCurLang(lang);
    setLoading(false);
  }

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return <Spin/>
  }

  return <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
    <Page lang={curLang} isDarK={isDark}/>
  </ConfigProvider>
}

root.render(
  <React.StrictMode>
    <LoadingPage/>
  </React.StrictMode>
);
