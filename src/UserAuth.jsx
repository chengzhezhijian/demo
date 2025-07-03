import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Menu, MenuItem, Toolbar, AppBar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// 创建认证上下文
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const UserAuth = ({ children }) => {
  const [username, setUsername] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  // 从本地存储加载用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('lottery_username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  // 登录处理
  const handleLogin = (user) => {
    setUsername(user);
    localStorage.setItem('lottery_username', user);
  };

  // 注册处理
  const handleRegister = (user) => {
    localStorage.setItem('lottery_username', user);
  };

  // 登出处理
  const handleLogout = () => {
    setUsername(null);
    localStorage.removeItem('lottery_username');
    setAnchorEl(null);
  };

  // 菜单处理
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 未登录用户重定向到登录页
  if (!username && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" replace />;
  }

  // 提供认证上下文
  const value = {
    username,
    onLogin: handleLogin,
    onRegister: handleRegister,
    onLogout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {username && (
        <AppBar position="static" sx={{ mb: 4 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              幸运抽奖系统
            </Typography>
            <Box>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>{username}</MenuItem>
                <MenuItem onClick={handleLogout}>退出登录</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export default UserAuth;