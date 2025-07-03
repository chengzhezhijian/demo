import { ConfigProvider, ThemeProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import LuckyWheel from './LuckyWheel';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import UserAuth from './UserAuth';
import { useState, useEffect } from 'react';
import 'antd/dist/reset.css';

// 动态主题配置
const App = () => {
  const [themeMode, setThemeMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#1890ff');

  // 监听主题切换快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.shiftKey && e.key === 'L') {
        setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 创建MUI主题
  const muiTheme = createTheme({
    palette: {
      mode: themeMode,
      primary: { main: primaryColor },
    },
  });

  // Ant Design主题
  const antdTheme = {
    token: {
      colorPrimary: primaryColor,
      borderRadius: 8,
    },
    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <ConfigProvider theme={antdTheme}>
        <Router>
          <UserAuth>
            <Routes>
              <Route path="/" element={<LuckyWheel />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </UserAuth>
        </Router>
      </ConfigProvider>
    </ThemeProvider>
  );
};

export default App;